import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintCategory, User, Complaint } from "../types";
import { storage } from "../services/storage";
import { analyzeComplaint } from "../services/mlEngine";
import { CATEGORY_LABELS } from "../constants";

const ComplaintPage: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<Complaint[]>([]);
  const [aiPreview, setAiPreview] = useState<any | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // --------------------
  // Load history
  // --------------------
  useEffect(() => {
    setHistory(storage.getComplaints());
  }, []);

  // --------------------
  // Live AI Preview (ASYNC SAFE)
  // --------------------
  useEffect(() => {
    if (description.length < 10) {
      setAiPreview(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await analyzeComplaint(description);
      if (!cancelled) setAiPreview(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [description]);

  // --------------------
  // Submit Complaint
  // --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await analyzeComplaint(description);
    const formData = new FormData();
    formData.append("description", description);
    if (image) formData.append("image", image);

    await fetch("http://localhost:8000/ml/complaint", {
      method: "POST",
      body: formData,
    });

    const newComplaint: Complaint = {
      id: "C" + Math.floor(Math.random() * 10000),
      studentId: user.id,
      studentName: user.name,
      roomNumber: user.roomNumber,
      hostelBlock: user.hostelBlock,

      // 🔥 ML decides final category
      category: result.category as ComplaintCategory,

      description,
      location: `Room ${user.roomNumber}`,
      createdAt: new Date().toISOString(),

      status: result.priorityScore >= 0.7 ? "escalated" : "open",
      priorityScore: result.priorityScore,

      // ✅ Explainability (REAL, not fake)
      // explanation: {
      //   sentiment: result.sentiment,
      //   reason:
      //     result.priority === "critical"
      //       ? "High negative sentiment detected"
      //       : "Normal complaint tone",
      // },

      // mlComponents: {
      //   sentiment: result.sentiment,
      //   categoryConfidence: result.categoryConfidence,
      // },

      affectedCount: description.match(/(\d+)/)
        ? parseInt(description.match(/(\d+)/)![0])
        : 1,
    };
    if (image) {
      formData.append("image", image);
    }

    storage.saveComplaint(newComplaint);

    setIsSubmitting(false);
    navigate("/student");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 font-mono">
          Lodge Complaint
        </h1>
        <p className="text-slate-500 mb-8">
          System performs real-time Sentiment & Priority analysis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">
              Issue Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(CATEGORY_LABELS) as ComplaintCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                      category === cat
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">
              Problem Description
            </label>
            <textarea
              // required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue clearly. Mention urgency or how many are affected."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* AI Preview */}
          {aiPreview && (
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase">
                  AI Analysis
                </span>
                <span className="text-white font-black">
                  {(aiPreview.priorityScore * 10).toFixed(1)}/10
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-slate-800 rounded-lg p-3">
                  <span className="block text-xs text-slate-400 uppercase">
                    Priority
                  </span>
                  <span className="text-indigo-300 font-bold capitalize">
                    {aiPreview.priority}
                  </span>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <span className="block text-xs text-slate-400 uppercase">
                    Category
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {aiPreview.category}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">
                Negative sentiment increases priority automatically.
              </p>
            </div>
          )}
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">
              Attach Image (Optional)
            </label>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 transition bg-slate-50">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5-4l-3 3m0 0l3 3m-3-3h12"
                  />
                </svg>

                <span className="text-sm font-semibold text-slate-600">
                  Click to upload an image
                </span>
                <span className="text-xs text-slate-400">
                  JPG, PNG (max 5MB)
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={imagePreview}
                  alt="Complaint Preview"
                  className="w-full max-h-64 object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            disabled={isSubmitting || description.length < 10}
            className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition ${
              isSubmitting || description.length < 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? "Analyzing Complaint…" : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintPage;
