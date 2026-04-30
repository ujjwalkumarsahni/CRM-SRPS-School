import React, { useState } from "react";
import {
  XCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  UserX,
  UserCheck,
  FileText,
  Image,
  Download,
  Eye,
  CreditCard,
  GraduationCap,
  User,
  Briefcase,
  Droplet,
} from "lucide-react";

const TeacherDetailsModal = ({
  teacher,
  onClose,
  onVerify,
  onReject,
  onDeactivate,
  onActivate,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);

  const handleDownload = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed, fallback used");

    // 🔥 fallback (same tab me download trigger karega)
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

  const getFileName = (url) => {
    return url.split("/").pop().split("?")[0];
  };

  const handleReject = async () => {
    if (await onReject(teacher._id, rejectReason)) {
      setShowRejectModal(false);
      setRejectReason("");
      onClose();
    }
  };

  const handleDeactivate = async () => {
    if (await onDeactivate(teacher._id, deactivateReason)) {
      setShowDeactivateModal(false);
      setDeactivateReason("");
      onClose();
    }
  };

  const openDocumentPreview = (url, name) => {
    setPreviewDocument({ url, name });
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-linear-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-xl font-semibold text-white">
              Teacher Details
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-[#F5C78B] transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#EADDCD]">
              <div className="w-24 h-24 bg-[#EADDCD] rounded-full flex items-center justify-center overflow-hidden">
                {teacher.profile?.photo?.url ? (
                  <img
                    src={teacher.profile.photo.url}
                    alt={teacher.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[#0D5166] text-3xl font-bold">
                    {teacher.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-[#0D5166]">
                  {teacher.name}
                </h4>
                <p className="text-gray-500">{teacher.designation}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      teacher.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {teacher.isVerified ? (
                      <CheckCircle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {teacher.isVerified ? "Verified" : "Pending Verification"}
                  </span>
                  {teacher.isActive && teacher.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <UserCheck size={12} /> Active
                    </span>
                  )}
                  {!teacher.isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      <UserX size={12} /> Inactive
                    </span>
                  )}
                  {teacher.profileCompleted && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <FileText size={12} /> Profile Complete
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal Information */}
              <div>
                <h5 className="text-md font-semibold text-[#0D5166] mb-3 flex items-center gap-2">
                  <User size={16} /> Personal Information
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="text-[#0D5166]" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{teacher.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-[#0D5166]" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium">{teacher.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="text-[#0D5166]" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Designation</p>
                      <p className="font-medium">{teacher.designation}</p>
                    </div>
                  </div>

                  {teacher.profile && (
                    <>
                      {teacher.profile.mobileNumber && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="text-[#0D5166]" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">
                              Mobile Number
                            </p>
                            <p className="font-medium">
                              {teacher.profile.mobileNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      {teacher.profile.dob && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="text-[#0D5166]" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">
                              Date of Birth
                            </p>
                            <p className="font-medium">
                              {new Date(teacher.profile.dob).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {teacher.profile.bloodGroup && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Droplet className="text-[#0D5166]" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">Blood Group</p>
                            <p className="font-medium">
                              {teacher.profile.bloodGroup}
                            </p>
                          </div>
                        </div>
                      )}

                      {teacher.profile.highestQualification && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <GraduationCap className="text-[#0D5166]" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">
                              Highest Qualification
                            </p>
                            <p className="font-medium">
                              {teacher.profile.highestQualification}
                            </p>
                          </div>
                        </div>
                      )}

                      {teacher.profile.address && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="text-[#0D5166]" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="font-medium">
                              {teacher.profile.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="text-[#0D5166]" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Joined On</p>
                      <p className="font-medium">
                        {new Date(teacher.createdAt).toLocaleDateString(
                          "en-GB",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Documents */}
              <div>
                <h5 className="text-md font-semibold text-[#0D5166] mb-3 flex items-center gap-2">
                  <FileText size={16} /> Documents
                </h5>
                <div className="space-y-3">
                  {/* Aadhar Card */}
                  {teacher.profile?.documents?.aadharCard && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-[#0D5166]" size={20} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Aadhar Card
                            </p>
                            <p className="text-xs text-gray-500">
                              Government ID Proof
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openDocumentPreview(
                                teacher.profile.documents.aadharCard.url,
                                "Aadhar Card",
                              )
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                teacher.profile.documents.aadharCard.url,
                                getFileName(
                                  teacher.profile.documents.aadharCard.url,
                                ),
                              )
                            }
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAN Card */}
                  {teacher.profile?.documents?.panCard && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-[#0D5166]" size={20} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              PAN Card
                            </p>
                            <p className="text-xs text-gray-500">
                              Tax Identification
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openDocumentPreview(
                                teacher.profile.documents.panCard.url,
                                "PAN Card",
                              )
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            onClick={() =>
                              handleDownload(
                                teacher.profile.documents.panCard.url,
                                getFileName(
                                  teacher.profile.documents.panCard.url,
                                ),
                              )
                            }
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Qualification Certificate */}
                  {teacher.profile?.documents?.qualificationCertificate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="text-[#0D5166]" size={20} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Qualification Certificate
                            </p>
                            <p className="text-xs text-gray-500">
                              Educational Document
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openDocumentPreview(
                                teacher.profile.documents
                                  .qualificationCertificate.url,
                                "Qualification Certificate",
                              )
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            onClick={() =>
                              handleDownload(
                                teacher.profile.documents
                                  .qualificationCertificate.url,
                                getFileName(
                                  teacher.profile.documents
                                    .qualificationCertificate.url,
                                ),
                              )
                            }
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Documents Message */}
                  {!teacher.profile?.documents?.aadharCard &&
                    !teacher.profile?.documents?.panCard &&
                    !teacher.profile?.documents?.qualificationCertificate && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText
                          size={48}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p>No documents uploaded yet</p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-[#EADDCD]">
              <div className="flex gap-3 flex-wrap">
                {!teacher.isVerified && teacher.profileCompleted && (
                  <>
                    <button
                      onClick={() => onVerify(teacher._id)}
                      className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Verify Teacher
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                  </>
                )}

                {teacher.isVerified && teacher.isActive && (
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserX size={18} /> Deactivate Account
                  </button>
                )}

                {!teacher.isActive && (
                  <button
                    onClick={() => onActivate(teacher._id)}
                    className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck size={18} /> Activate Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                {previewDocument.name}
              </h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="text-white hover:text-[#F5C78B] transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 h-[70vh] overflow-auto">
              {previewDocument.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                <img
                  src={previewDocument.url}
                  alt={previewDocument.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <iframe
                  src={previewDocument.url}
                  title={previewDocument.name}
                  className="w-full h-full rounded-lg"
                  style={{ minHeight: "500px" }}
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#EADDCD] flex justify-end">
              <button
                type="button"
                onClick={() =>
                  handleDownload(
                    previewDocument.url,
                    getFileName(previewDocument.url),
                  )
                }
                className="bg-[#0D5166] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                Reject Teacher Application
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject <strong>{teacher.name}</strong>
                's application?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                Deactivate Teacher Account
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to deactivate{" "}
                <strong>{teacher.name}</strong>'s account?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Deactivation{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Please provide a reason for deactivation..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeactivate}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherDetailsModal;
