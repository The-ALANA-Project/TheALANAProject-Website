import { useState, useEffect, useMemo } from 'react';
import { Branch, BRANCH_FACTORS, ContributionTemplate } from '../types/contribution';
import { toast } from 'sonner';

const FIXED_REACH = 1453;

const allBranches: Branch[] = [
  'Infrastructure & Strategy',
  'Identity & Socials',
  'ALANAmagazine',
  'ALANAboutique',
  'FABA Studio',
];

interface OneOffTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<ContributionTemplate, 'id'>) => void;
  existingTask?: ContributionTemplate;
}

export function OneOffTaskModal({ isOpen, onClose, onSave, existingTask }: OneOffTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [orgImpact, setOrgImpact] = useState('');
  const [customerImpact, setCustomerImpact] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(existingTask?.category || '');
      setDescription(existingTask?.description || '');
      setSelectedBranches(existingTask?.branches || []);
      setOrgImpact(existingTask?.orgImpact?.toString() || '');
      setCustomerImpact(existingTask?.customerImpact?.toString() || '');
      setAssignedTo(existingTask?.assignedTo || '');
    }
  }, [isOpen, existingTask]);

  const previewReward = useMemo(() => {
    const org = parseFloat(orgImpact);
    const cust = parseFloat(customerImpact);
    if (!selectedBranches.length || isNaN(org) || isNaN(cust)) return null;
    const branchFactor = Math.max(...selectedBranches.map((b) => BRANCH_FACTORS[b]));
    return Math.round(FIXED_REACH * (org + cust) * 0.7 * 0.8 * (branchFactor / 10));
  }, [orgImpact, customerImpact, selectedBranches]);

  const isFormValid =
    title.trim() !== '' &&
    selectedBranches.length > 0 &&
    description.trim() !== '' &&
    !isNaN(parseFloat(orgImpact)) && parseFloat(orgImpact) >= 0 &&
    !isNaN(parseFloat(customerImpact)) && parseFloat(customerImpact) >= 0;

  const toggleBranch = (branch: Branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Please enter a task title'); return; }
    if (selectedBranches.length === 0) { toast.error('Please select at least one branch'); return; }
    if (!description.trim()) { toast.error('Please enter a description'); return; }
    const orgNum = parseFloat(orgImpact);
    const custNum = parseFloat(customerImpact);
    if (isNaN(orgNum) || orgNum < 0) { toast.error('Please enter a valid org impact'); return; }
    if (isNaN(custNum) || custNum < 0) { toast.error('Please enter a valid customer impact'); return; }

    onSave({
      category: title.trim(),
      branches: selectedBranches,
      description: description.trim(),
      tools: 'N/A',
      reach: FIXED_REACH,
      orgImpact: orgNum,
      customerImpact: custNum,
      isOneOff: true,
      assignedTo: assignedTo.trim() || undefined,
      isDraft: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-background border border-foreground max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-medium">
                {existingTask ? 'Edit One-off Task' : 'Create One-off Task'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                This task will appear in the Quest Library once created.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Task Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Write a brand story for the October launch…"
              className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Branches */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Branch <span className="text-accent">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allBranches.map((branch) => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => toggleBranch(branch)}
                  className={`px-3 py-1.5 text-sm border transition-colors ${
                    selectedBranches.includes(branch)
                      ? 'bg-accent/20 text-foreground border-accent'
                      : 'bg-background text-foreground border-border hover:border-accent'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Description <span className="text-accent">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exactly what the contributor needs to deliver…"
              rows={4}
              className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Impact Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block">
                Org Impact <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={orgImpact}
                onChange={(e) => setOrgImpact(e.target.value)}
                placeholder="e.g., 1.0"
                min="0"
                className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">3 massive · 2 high · 1 medium · 0.5 low · 0.25 minimal</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">
                Customer Impact <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={customerImpact}
                onChange={(e) => setCustomerImpact(e.target.value)}
                placeholder="e.g., 0.5"
                min="0"
                className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">3 massive · 2 high · 1 medium · 0.5 low · 0.25 minimal</p>
            </div>
          </div>

          {/* Live reward preview */}
          {previewReward !== null && (
            <div className="flex items-center justify-between px-4 py-3 bg-[#262424] border border-[#262424]">
              <span className="text-sm text-[#D9D9D9]">Estimated reward (at 70% effort · 80% quality)</span>
              <span className="text-lg font-bold font-mono text-[#FFDDB2]">{previewReward.toLocaleString()} $ALANA</span>
            </div>
          )}

          {/* Assigned To */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Assigned To{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="0x… — leave blank to show to all contributors"
              className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              If set, only this wallet address will see the task in the Quest Library.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="bg-background border border-border text-foreground font-medium px-5 h-10 hover:border-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 font-medium h-10 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-accent text-foreground hover:bg-foreground hover:text-background"
            >
              {existingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
