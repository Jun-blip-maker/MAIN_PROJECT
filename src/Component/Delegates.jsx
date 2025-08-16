import React, { useState, useEffect } from "react";
import axios from "axios";

const Delegates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voterData, setVoterData] = useState({
    fullName: "",
    registrationNumber: "",
  });
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/candidates"
        );
        setCandidates(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load candidates");
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setError("");
  };

  const handleVoterChange = (e) => {
    const { name, value } = e.target;
    setVoterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitVote = async (e) => {
    e.preventDefault();

    if (!selectedCandidate || !voterData.registrationNumber) {
      setError("Please select a candidate and enter your registration number");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/vote", {
        voterRegNumber: voterData.registrationNumber,
        candidateId: selectedCandidate.id,
      });

      setSuccess(true);
      setError("");
      setVoterData({ fullName: "", registrationNumber: "" });
      setSelectedCandidate(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit vote");
    }
  };

  // Group candidates by school
  const candidatesBySchool = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.school]) acc[candidate.school] = [];
    acc[candidate.school].push(candidate);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
              {selectedCandidate
                ? "Confirm Your Vote"
                : "Student Delegates Election"}
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                <p>Thank you for voting! Your vote has been recorded.</p>
              </div>
            )}

            {!selectedCandidate ? (
              <div className="space-y-8">
                {Object.entries(candidatesBySchool).map(
                  ([school, schoolCandidates]) => (
                    <div
                      key={school}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {school}
                      </h2>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {schoolCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                            onClick={() => handleCandidateSelect(candidate)}
                          >
                            <h3 className="font-medium text-gray-900">
                              {candidate.fullName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {candidate.registrationNumber}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitVote} className="space-y-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-indigo-800">
                    Selected Candidate
                  </h3>
                  <div className="mt-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCandidate.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCandidate.school}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reg: {selectedCandidate.registrationNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={voterData.fullName}
                    onChange={handleVoterChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="registrationNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    id="registrationNumber"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={voterData.registrationNumber}
                    onChange={handleVoterChange}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Vote
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delegates;
