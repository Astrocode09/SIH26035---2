import React, { useState } from 'react';
import { DeviceUnderTest } from '../../types/metrology';
import { alternativeDevices } from '../../data/metrologyData';

interface DeviceSetupModalProps {
  currentDevice: DeviceUnderTest;
  isOpen: boolean;
  onClose: () => void;
  onSelectDevice: (device: DeviceUnderTest) => void;
}

export const DeviceSetupModal: React.FC<DeviceSetupModalProps> = ({
  currentDevice,
  isOpen,
  onClose,
  onSelectDevice,
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentDevice.id);

  if (!isOpen) return null;

  const handleApply = () => {
    const found = alternativeDevices.find((d) => d.id === selectedId);
    if (found) {
      onSelectDevice(found);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001428]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#c3c6ce]/40 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#001428] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">tune</span>
            <span className="font-bold text-[15px]">Device Under Test (DUT) Metrological Profile</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#cbdbf5] text-[18px] font-mono leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-[#0b1c30]">
          <p className="text-[12px] text-[#43474d]">
            Select an OIML R-76 accredited instrument profile or test vector to simulate verification across Class I, II, and III scales:
          </p>

          <div className="space-y-2.5">
            {alternativeDevices.map((dev) => {
              const isSelected = selectedId === dev.id;
              return (
                <button
                  key={dev.id}
                  onClick={() => setSelectedId(dev.id)}
                  className={`w-full text-left p-3.5 rounded border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-[#8fdfff]/20 border-[#006781] shadow-xs ring-1 ring-[#006781]'
                      : 'bg-[#eff4ff] hover:bg-[#dce9ff]/60 border-[#c3c6ce]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[14px] text-[#001428]">{dev.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded">
                      {dev.accuracyClass.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#43474d]">{dev.model} • {dev.manufacturer}</span>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#006781] mt-1 pt-1 border-t border-[#c3c6ce]/20">
                    <span>Max: {dev.maxCapacityKg} kg</span>
                    <span>•</span>
                    <span>e = {dev.scaleIntervalE_g} g</span>
                    <span>•</span>
                    <span>d = {dev.scaleIntervalD_g} g</span>
                    <span>•</span>
                    <span>n = {dev.numberOfIntervals.toLocaleString()}e</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#c3c6ce]/20 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] rounded text-[12px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-[#001428] hover:bg-[#0f2942] text-white rounded text-[12px] font-semibold transition-colors"
            >
              Load Instrument Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
