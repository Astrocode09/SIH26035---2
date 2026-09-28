import React, { useState } from 'react';

interface CitizenGrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCommandCenter?: () => void;
}

export const CitizenGrievanceModal: React.FC<CitizenGrievanceModalProps> = ({
  isOpen,
  onClose,
  onViewCommandCenter,
}) => {
  const [formData, setFormData] = useState({
    category: 'PETROL_PUMP',
    establishmentName: '',
    location: '',
    commodity: 'Motor Spirit (Petrol)',
    billedQuantity: '5.00',
    unit: 'Litres',
    actualQuantity: '4.78',
    consumerName: '',
    consumerPhone: '',
    incidentDescription: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedTicket, setGeneratedTicket] = useState<{
    docketNumber: string;
    deviationPct: number;
    statutoryViolation: string;
    timestamp: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const billed = parseFloat(formData.billedQuantity) || 1;
    const actual = parseFloat(formData.actualQuantity) || 1;
    const deficit = billed - actual;
    const deviationPct = Number(((deficit / billed) * 100).toFixed(2));

    setTimeout(() => {
      setIsSubmitting(false);
      setGeneratedTicket({
        docketNumber: `NCH-1915-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        deviationPct,
        statutoryViolation:
          deviationPct > 0.5
            ? 'Section 15 & Section 30, Legal Metrology Act, 2009 (Unlawful Short Delivery Beyond MPE Limits)'
            : 'Warning Issued (Under Observation)',
        timestamp: new Date().toUTCString(),
      });
    }, 900);
  };

  const handleReset = () => {
    setGeneratedTicket(null);
    setFormData({
      category: 'PETROL_PUMP',
      establishmentName: '',
      location: '',
      commodity: 'Motor Spirit (Petrol)',
      billedQuantity: '5.00',
      unit: 'Litres',
      actualQuantity: '4.78',
      consumerName: '',
      consumerPhone: '',
      incidentDescription: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001428]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c3c6ce]/50 max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffd043] text-[#001428] flex items-center justify-center text-[22px] font-bold shadow-xs">
              📢
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase">
                NATIONAL CONSUMER HELPLINE • 1915
              </span>
              <h3 className="text-[16px] font-bold text-[#001428] mt-0.5 leading-tight">
                Jago Grahak Jago: Report Short-Weighing / Short-Delivery
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#eff4ff] rounded text-[#74777e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!generatedTicket ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[13px]">
            <p className="text-[12px] text-[#43474d] leading-relaxed">
              If you suspect you have been short-changed at a <strong>petrol pump, grocery store, mandi, ration shop, or with an LPG cylinder</strong>, lodge your statutory complaint here. It will be verified against OIML R-76 MPE tolerances and dispatched directly to the District Legal Metrology Officer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Violation Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    let defCommodity = 'Petrol';
                    let defUnit = 'Litres';
                    let billed = '5.00';
                    let actual = '4.78';
                    if (cat === 'LPG_CYLINDER') {
                      defCommodity = 'Domestic LPG Gas (14.2 kg)';
                      defUnit = 'kg';
                      billed = '14.20';
                      actual = '12.85';
                    } else if (cat === 'PACKAGED_FOOD') {
                      defCommodity = 'Chakki Atta (10 kg bag)';
                      defUnit = 'kg';
                      billed = '10.00';
                      actual = '9.32';
                    } else if (cat === 'RATION_SHOP') {
                      defCommodity = 'PMGKAY Wheat/Rice Ration';
                      defUnit = 'kg';
                      billed = '35.00';
                      actual = '33.20';
                    } else if (cat === 'MANDI_GRAIN') {
                      defCommodity = 'Paddy / Wheat Harvest';
                      defUnit = 'Quintals';
                      billed = '100.00';
                      actual = '98.50';
                    }
                    setFormData({
                      ...formData,
                      category: cat,
                      commodity: defCommodity,
                      unit: defUnit,
                      billedQuantity: billed,
                      actualQuantity: actual,
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428] focus:outline-none focus:border-[#006781]"
                >
                  <option value="PETROL_PUMP">⛽ Petrol Pump / Diesel Dispenser</option>
                  <option value="LPG_CYLINDER">🔥 Domestic LPG Gas Cylinder</option>
                  <option value="PACKAGED_FOOD">📦 Packaged Commodity / Grocery</option>
                  <option value="RATION_SHOP">🍚 Fair Price Shop (Ration Shop)</option>
                  <option value="MANDI_GRAIN">🌾 APMC Mandi Harvest Weighbridge</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Establishment / Dealer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Highway Filling Station / Modern Traders"
                  value={formData.establishmentName}
                  onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428] focus:outline-none focus:border-[#006781]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Location / City / Mandi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NH-44 Ambala / Dadar, Mumbai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428] focus:outline-none focus:border-[#006781]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Commodity Name
                </label>
                <input
                  type="text"
                  value={formData.commodity}
                  onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428] focus:outline-none focus:border-[#006781]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#f8f9ff] p-3 rounded-xl border border-[#c3c6ce]/30">
              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Billed Qty ({formData.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.billedQuantity}
                  onChange={(e) => setFormData({ ...formData, billedQuantity: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#c3c6ce]/50 rounded text-[12px] font-mono font-bold text-[#001428]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#ba1a1a] mb-1">
                  Actual Delivered ({formData.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.actualQuantity}
                  onChange={(e) => setFormData({ ...formData, actualQuantity: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#ba1a1a]/50 rounded text-[12px] font-mono font-bold text-[#ba1a1a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#006781] mb-1">
                  Calculated Deficit
                </label>
                <div className="px-2.5 py-1.5 bg-[#eff4ff] border border-[#c3c6ce]/30 rounded text-[12px] font-mono font-bold text-[#ba1a1a]">
                  -{(parseFloat(formData.billedQuantity || '0') - parseFloat(formData.actualQuantity || '0')).toFixed(2)} {formData.unit}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Complainant Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.consumerName}
                  onChange={(e) => setFormData({ ...formData, consumerName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#001428] mb-1">
                  Mobile Number (For SMS Tracking)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.consumerPhone}
                  onChange={(e) => setFormData({ ...formData, consumerPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#c3c6ce]/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#c3c6ce]/50 text-[#43474d] rounded-lg text-[12px] font-semibold hover:bg-[#eff4ff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#001428] hover:bg-[#006781] disabled:opacity-50 text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Validating OIML Tolerances...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Lodge Statutory Complaint (NCH 1915)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="bg-[#d5f7e6] text-[#002e1d] p-4 rounded-xl border border-[#21a173] flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-[#21a173]">check_circle</span>
              <div>
                <h4 className="font-bold text-[14px]">
                  Grievance Formally Registered with National Consumer Helpline!
                </h4>
                <span className="text-[11px] block mt-0.5">
                  Statutory Docket #{generatedTicket.docketNumber} has been issued and queued for district LMO Flying Squad action.
                </span>
              </div>
            </div>

            <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c3c6ce]/40 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#74777e]">DOCKET NUMBER:</span>
                <span className="font-bold text-[#001428]">{generatedTicket.docketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777e]">ESTABLISHMENT:</span>
                <span className="font-bold text-[#001428]">{formData.establishmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777e]">LOCATION:</span>
                <span>{formData.location}</span>
              </div>
              <div className="flex justify-between text-[#ba1a1a] font-bold">
                <span>MEASURED SHORTFALL:</span>
                <span>-{generatedTicket.deviationPct}%</span>
              </div>
              <div className="flex justify-between border-t border-[#c3c6ce]/30 pt-1">
                <span className="text-[#74777e]">LEGAL INVOLVEMENT:</span>
                <span className="text-[#ba1a1a] font-semibold truncate max-w-[280px]">
                  {generatedTicket.statutoryViolation}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#43474d] leading-relaxed">
              Under <strong>Section 15 of the Legal Metrology Act, 2009</strong>, any person who delivers less than the quantity contracted is liable for on-spot seizure and compounding fine up to ₹50,000. An encrypted notification has been dispatched to the jurisdictional Assistant Controller of Legal Metrology.
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-[#c3c6ce]/20">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 border border-[#c3c6ce]/40 text-[#001428] rounded text-[11px] font-semibold hover:bg-[#eff4ff] cursor-pointer"
              >
                File Another Complaint
              </button>

              <div className="flex items-center gap-2">
                {onViewCommandCenter && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewCommandCenter();
                    }}
                    className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006781] rounded text-[11px] font-bold border border-[#c3c6ce]/40 cursor-pointer"
                  >
                    View Ministry Cockpit
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#001428] hover:bg-[#006781] text-white rounded text-[11px] font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
