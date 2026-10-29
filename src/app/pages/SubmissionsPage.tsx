import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubmissions, submitForReview, deleteSubmission } from '../services/submissionsService';
import { ContributionSubmission } from '../types/contribution';
import { Footer } from '../components/Footer';
import { toast } from 'sonner';
import { linkifyText } from '../utils/linkify';
import { MissionSubmittedModal } from '../components/MissionSubmittedModal';

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'text-foreground',
    bg: 'bg-[#CEAAFE]/20',
    border: 'border-[#CEAAFE]',
  },
  pending: {
    label: 'Pending Review',
    color: 'text-foreground',
    bg: 'bg-[#FFDDB2]/20',
    border: 'border-[#FFDDB2]',
  },
  in_review: {
    label: 'In Review',
    color: 'text-foreground',
    bg: 'bg-[#F5A623]/20',
    border: 'border-[#F5A623]',
  },
  needs_revision: {
    label: 'Needs Revision',
    color: 'text-foreground',
    bg: 'bg-[#FFDDB2]/20',
    border: 'border-[#FFDDB2]',
  },
  approved: {
    label: 'Approved',
    color: 'text-foreground',
    bg: 'bg-[#27EF8C]/20',
    border: 'border-[#27EF8C]',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-foreground',
    bg: 'bg-red-500/20',
    border: 'border-red-500',
  },
};

export function SubmissionsPage() {
  const navigate = useNavigate();
  const { address, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<ContributionSubmission[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const loadSubmissions = async () => {
    if (address) {
      const userSubs = await getUserSubmissions(address);
      setSubmissions(userSubs.sort((a, b) => b.submittedAt - a.submittedAt));
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [address]);

  const handleDelete = async (submissionId: string) => {
    if (!window.confirm('Are you sure you want to delete this quest? This cannot be undone.')) return;
    const success = await deleteSubmission(submissionId);
    if (success) {
      toast.success('Quest deleted.');
      loadSubmissions();
    } else {
      toast.error('Failed to delete quest.');
    }
  };

  const handleSubmitForReview = async (submissionId: string) => {
    const result = await submitForReview(submissionId);
    if (result) {
      loadSubmissions();
      setShowCelebration(true);
    } else {
      toast.error('Failed to submit for review');
    }
  };

  if (!isAuthenticated || !address) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-8">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-sans">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your quest history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-8 md:px-16 py-16 max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <h2 className="font-sans">My Quests</h2>
              <p className="text-lg text-muted-foreground">
                Track your quest history and review submitted work.
              </p>
            </div>
            <button
              onClick={() => navigate('/quest-library')}
              className="flex items-center gap-2 bg-accent border border-accent text-foreground font-medium px-6 h-10 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-colors hover:bg-white/10 hover:backdrop-blur-sm hover:border-black whitespace-nowrap"
            >
              New Quest
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-border rounded-[4px] p-6">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-3xl font-bold mt-1">{submissions.length}</div>
            </div>
            <div className="border border-border rounded-[4px] p-6">
              <div className="text-sm text-muted-foreground">Drafts</div>
              <div className="text-3xl font-bold mt-1 text-[#CEAAFE]">
                {submissions.filter((s) => s.status === 'draft').length}
              </div>
            </div>
            <div className="border border-border rounded-[4px] p-6">
              <div className="text-sm text-muted-foreground">In Review</div>
              <div className="text-3xl font-bold mt-1 text-[#FFDDB2]">
                {submissions.filter((s) => s.status === 'pending' || s.status === 'in_review').length}
              </div>
            </div>
            <div className="border border-border rounded-[4px] p-6">
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="text-3xl font-bold mt-1 text-[#27EF8C]">
                {submissions.filter((s) => s.status === 'approved').length}
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {submissions.length === 0 ? (
            <div className="border border-border rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-12 text-center space-y-4">
              <p className="text-muted-foreground">You haven't submitted any quests yet.</p>
              <button
                onClick={() => navigate('/quest-library')}
                className="inline-flex items-center gap-2 bg-accent border border-accent text-foreground font-medium px-6 h-10 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-colors hover:bg-white/10 hover:backdrop-blur-sm hover:border-black"
              >
                Browse Quest Library
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const isReceivedSplit = submission.splitAddress?.toLowerCase() === address?.toLowerCase()
                  && submission.userAddress?.toLowerCase() !== address?.toLowerCase();

                const finalReward = submission.finalReward ?? submission.calculatedReward;
                const approvedSplit = submission.approvedSplitPercentage ?? submission.splitPercentage;

                // Reward figures for this user specifically
                const myShare = isReceivedSplit && approvedSplit != null
                  ? Math.round(finalReward * approvedSplit / 100)
                  : (submission.splitPercentage != null && !isReceivedSplit && approvedSplit != null)
                    ? Math.round(finalReward * (100 - approvedSplit) / 100)
                    : finalReward;

                const coShare = approvedSplit != null
                  ? Math.round(finalReward * approvedSplit / 100)
                  : null;

                const isDraft = submission.status === 'draft';
                const needsRevision = submission.status === 'needs_revision';

                return (
                  <div
                    key={submission.id}
                    className={`border rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-6 hover:border-accent transition-colors ${isReceivedSplit ? 'border-accent/40 bg-accent/5' : 'border-border'}`}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-medium">{submission.templateName}</h4>
                            {isReceivedSplit ? (
                              <span className="text-xs px-2 py-1 bg-accent/20 border border-accent text-foreground">
                                Shared by {submission.contributorName}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">by {submission.contributorName}</span>
                            )}
                            {!isReceivedSplit && submission.splitAddress && (
                              <span className="text-xs px-2 py-1 bg-foreground/10 border border-foreground text-muted-foreground">
                                Split with {submission.splitHandle || `${submission.splitAddress.slice(0, 6)}…${submission.splitAddress.slice(-4)}`}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {submission.branches.map((branch) => (
                              <span
                                key={branch}
                                className="text-xs px-2 py-1 bg-accent/20 text-foreground border border-accent"
                              >
                                {branch}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 border ${statusConfig[submission.status].bg} ${statusConfig[submission.status].border}`}
                          >
                            <span className={`text-sm font-medium ${statusConfig[submission.status].color}`}>
                              {statusConfig[submission.status].label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border">
                        <div>
                          <div className="text-xs text-muted-foreground">Battery Life</div>
                          <div className="text-sm font-medium">
                            {submission.adjustedBatteryLife || submission.batteryLife}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Quality</div>
                          <div className="text-sm font-medium">
                            {submission.adjustedQuality || submission.quality}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Total Reward</div>
                          <div className="text-sm font-medium text-accent">
                            {finalReward.toLocaleString()} $ALANA
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {submission.splitPercentage != null ? 'Your Share' : 'Final Reward'}
                          </div>
                          <div className="text-sm font-medium text-[#FFDDB2]">
                            {myShare.toLocaleString()} $ALANA
                            {approvedSplit != null && (
                              <span className="text-xs text-muted-foreground ml-1 font-normal">
                                ({isReceivedSplit ? approvedSplit : 100 - approvedSplit}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Split breakdown — full transparency */}
                      {submission.splitAddress && (
                        <div className="pt-3 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-2">Reward split</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-foreground/5 border border-foreground px-4 py-3">
                              <div className="text-xs text-muted-foreground mb-1">
                                {submission.contributorName} (submitter)
                              </div>
                              <div className="text-sm font-mono font-medium">
                                {approvedSplit != null
                                  ? Math.round(finalReward * (100 - approvedSplit) / 100).toLocaleString()
                                  : finalReward.toLocaleString()}{' '}
                                $ALANA
                                {approvedSplit != null && (
                                  <span className="text-xs text-muted-foreground ml-1">({100 - approvedSplit}%)</span>
                                )}
                              </div>
                            </div>
                            <div className="bg-foreground/5 border border-foreground px-4 py-3">
                              <div className="text-xs text-muted-foreground mb-1">
                                {submission.splitHandle || `${submission.splitAddress.slice(0, 6)}…${submission.splitAddress.slice(-4)}`} (co-contributor)
                              </div>
                              <div className="text-sm font-mono font-medium">
                                {coShare != null ? `${coShare.toLocaleString()} $ALANA` : '—'}
                                {approvedSplit != null && (
                                  <span className="text-xs text-muted-foreground ml-1">({approvedSplit}%)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {submission.approvedSplitPercentage == null && submission.splitPercentage != null && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Suggested split — subject to Guardian adjustment.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Proof of Work */}
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-2">Proof of Work:</div>
                        <div className="text-sm bg-background/50 p-3 rounded-tl-[2px] rounded-tr-none rounded-tl-[2px] rounded-tr-none rounded-br-[10px] rounded-bl-[2px] rounded-bl-[2px] border border-border whitespace-pre-wrap break-words">
                          {linkifyText(submission.proofOfWork)}
                        </div>
                        {submission.proofImages && submission.proofImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {submission.proofImages.map((image, idx) => (
                              <img
                                key={idx}
                                src={image}
                                alt={`Proof ${idx + 1}`}
                                className="w-full h-32 object-cover border border-border rounded-tl-[2px] rounded-tr-none rounded-br-[10px] rounded-bl-[2px] cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(image, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Guardian Feedback History */}
                      {submission.reviewHistory && submission.reviewHistory.length > 0 && (
                        <div className="pt-3 border-t border-border space-y-2">
                          <div className="text-xs text-muted-foreground mb-2">Guardian Feedback:</div>
                          {submission.reviewHistory.map((entry, i) => (
                            <div
                              key={i}
                              className={`text-sm p-3 rounded-tl-[2px] rounded-tr-none rounded-tl-[2px] rounded-tr-none rounded-br-[10px] rounded-bl-[2px] rounded-bl-[2px] border ${
                                entry.outcome === 'approved'
                                  ? 'bg-[#27EF8C]/5 border-[#27EF8C]/30'
                                  : 'bg-[#FFDDB2]/10 border-[#FFDDB2]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${entry.outcome === 'approved' ? 'text-[#27EF8C]' : 'text-[#F5A623]'}`}>
                                  {entry.outcome === 'approved' ? 'Approved' : 'Changes Requested'} — Round {i + 1}
                                  {entry.reviewerName && (
                                    <span className="text-foreground font-normal ml-1">by {entry.reviewerName}</span>
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.reviewedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p>{entry.note}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions — read-only for received splits */}
                      {!isReceivedSplit && (
                        <div className="flex justify-end gap-3 pt-3 border-t border-border">
                          {isDraft && (
                            <>
                              <button
                                onClick={() => navigate(`/calculator/${submission.templateId}`, {
                                  state: { submission }
                                })}
                                className="flex items-center gap-2 bg-background border border-border text-foreground font-medium px-4 h-10 hover:border-accent transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSubmitForReview(submission.id)}
                                className="flex items-center gap-2 bg-accent border border-accent text-foreground font-medium px-4 h-10 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-colors hover:bg-foreground hover:text-background"
                              >
                                Submit for Review
                              </button>
                            </>
                          )}
                          {needsRevision && (
                            <>
                              <button
                                onClick={() => navigate(`/calculator/${submission.templateId}`, {
                                  state: { submission }
                                })}
                                className="flex items-center gap-2 bg-background border border-border text-foreground font-medium px-4 h-10 hover:border-accent transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSubmitForReview(submission.id)}
                                className="flex items-center gap-2 bg-[#FFDDB2] border border-[#FFDDB2] text-black font-medium px-4 h-10 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-colors hover:opacity-90"
                              >
                                Resubmit
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="flex items-center gap-2 bg-background border border-destructive text-destructive font-medium px-4 h-10 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                        <span>
                          Created: {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                        {submission.submittedForReviewAt && (
                          <span>
                            Submitted: {new Date(submission.submittedForReviewAt).toLocaleDateString()}
                          </span>
                        )}
                        {submission.reviewedAt && (
                          <span>
                            Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <MissionSubmittedModal open={showCelebration} onClose={() => setShowCelebration(false)} />
    </>
  );
}
