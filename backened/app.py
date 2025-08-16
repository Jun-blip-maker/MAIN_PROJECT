from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from functools import wraps

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Database setup
db = SQLAlchemy(app)

# Models
class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email_or_phone = db.Column(db.String(100), nullable=False)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    school = db.Column(db.String(100))
    is_candidate = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)
    
    votes_received = db.relationship('Vote', backref='candidate', foreign_keys='Vote.candidate_id')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Vote(db.Model):
    __tablename__ = 'votes'
    
    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.Integer, db.ForeignKey('students.id'))
    candidate_id = db.Column(db.Integer, db.ForeignKey('students.id'))
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    
    voter = db.relationship('Student', foreign_keys=[voter_id])

# Configuration
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///voting.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Helpers
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = Student.query.get(data['sub'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    if not any(not c.isalnum() for c in password):
        errors.append("Password must contain at least one special character")
    return errors

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['fullName', 'emailOrPhone', 'registrationNumber', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if Student.query.filter_by(registration_number=data['registrationNumber']).first():
        return jsonify({'error': 'Registration number already exists'}), 400
    
    password_errors = validate_password(data['password'])
    if password_errors:
        return jsonify({'error': 'Password does not meet requirements', 'details': password_errors}), 400
    
    student = Student(
        full_name=data['fullName'],
        email_or_phone=data['emailOrPhone'],
        registration_number=data['registrationNumber'],
        school=data.get('school', ''),
        is_candidate=data.get('isCandidate', False)
    )
    student.set_password(data['password'])
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'student': {
            'id': student.id,
            'fullName': student.full_name,
            'registrationNumber': student.registration_number
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('registrationNumber') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400
    
    student = Student.query.filter_by(
        registration_number=data['registrationNumber']
    ).first()
    
    if not student or not student.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'sub': student.id,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'student': {
            'id': student.id,
            'fullName': student.full_name,
            'registrationNumber': student.registration_number,
            'isCandidate': student.is_candidate
        }
    })

@app.route('/api/candidates', methods=['GET'])
@token_required
def get_candidates(current_user):
    candidates = Student.query.filter_by(is_candidate=True, is_approved=True).all()
    return jsonify([{
        'id': s.id,
        'fullName': s.full_name,
        'registrationNumber': s.registration_number,
        'school': s.school
    } for s in candidates])

@app.route('/api/vote', methods=['POST'])
@token_required
def vote(current_user):
    data = request.get_json()
    
    if not data.get('candidateId'):
        return jsonify({'error': 'Missing candidate ID'}), 400
    
    if Vote.query.filter_by(voter_id=current_user.id).first():
        return jsonify({'error': 'You have already voted'}), 400
    
    candidate = Student.query.get(data['candidateId'])
    if not candidate or not candidate.is_candidate or not candidate.is_approved:
        return jsonify({'error': 'Invalid candidate'}), 400
    
    vote = Vote(voter_id=current_user.id, candidate_id=candidate.id)
    db.session.add(vote)
    db.session.commit()
    
    return jsonify({'message': 'Vote recorded successfully'}), 201

@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user.id,
        'fullName': current_user.full_name,
        'registrationNumber': current_user.registration_number,
        'isCandidate': current_user.is_candidate
    })

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)