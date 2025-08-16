from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

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