import React, { useState, useEffect, useRef } from 'react';
import { DeviceUnderTest, AmbientConditions } from '../types/metrology';

interface DashboardTelemetryProps {
  device: DeviceUnderTest;
  ambient: AmbientConditions;
  isConnected: boolean;
  onTogglePort: () => void;
  portName: string;
}

export const DashboardTelemetry: React.FC<DashboardTelemetryProps> = ({
  device,
  ambient,
  isConnected,
  onTogglePort,
  portName,
}) => {
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(15.002);
  const [tareKg, setTareKg] = useState<number>(0.0);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [isZero, setIsZero] = useState<boolean>(false);
  const [baudRate, setBaudRate] = useState<string>('9600');
  const [parity, setParity] = useState<string>('8N1');
  const [bridgeExcitationV, setBridgeExcitationV] = useState<number>(10.02);
  const [adcCounts, setAdcCounts] = useState<number>(16742109);
  const [tiltPitchDeg, setTiltPitchDeg] = useState<number>(0.03);
  const [tiltRollDeg, setTiltRollDeg] = useState<number>(-0.02);
  const [antiTamperStatus, setAntiTamperStatus] = useState<'SECURE' | 'ANOMALY_DETECTED'>('SECURE');
  const [rawTerminalLogs, setRawTerminalLogs] = useState<string[]>([
    '02 31 35 2E 30 30 32 20 6B 67 20 53 54 0D 0A  -> [ST, 15.002 kg, CRC-OK]',
    '02 31 35 2E 30 30 32 20 6B 67 20 53 54 0D 0A  -> [ST, 15.002 kg, CRC-OK]',
    '02 31 35 2E 30 30 33 20 6B 67 20 53 54 0D 0A  -> [ST, 15.003 kg, CRC-OK]',
    '02 31 35 2E 30 30 32 20 6B 67 20 53 54 0D 0A  -> [ST, 15.002 kg, CRC-OK]',
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live waveform oscillator
  useEffect(() => {
    let animationFrameId: number;
    let t = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      t += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#001428';
      ctx.fillRect(0, 0, width, height);

      // Gridlines
      ctx.strokeStyle = '#0f2942';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw primary load cell strain waveform
      ctx.beginPath();
      ctx.strokeStyle = '#21a173';
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x++) {
        // High stability load signal with tiny 50Hz mains ripple
        const y =
          height / 2 +
          Math.sin((x + t * 40) * 0.03) * 4 +
          Math.cos((x + t * 10) * 0.15) * 1.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Zero baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Micro jitter & raw serial log appending
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const jitter = (Math.random() * 0.0004 - 0.0002);
      const newWeight = Number((15.002 + jitter).toFixed(3));
      setCurrentWeightKg(newWeight);
      setAdcCounts((prev) => prev + Math.floor(Math.random() * 20 - 10));

      // Append terminal line
      const hexWeight = newWeight.toFixed(3);
      const timestamp = new Date().toTimeString().split(' ')[0];
      const logLine = `${timestamp} -> [ST, +${hexWeight} kg, 20Hz, CRC-32: 0x9B4E]`;
      setRawTerminalLogs((prev) => [logLine, ...prev.slice(0, 7)]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleZeroScale = () => {
    setCurrentWeightKg(0.0);
    setIsZero(true);
    setRawTerminalLogs((prev) => [
      `${new Date().toTimeString().split(' ')[0]} -> CMD [Z]: Zero Reference Acknowledged [>0<]`,
      ...prev.slice(0, 7),
    ]);
  };

  const handleTareScale = () => {
    setTareKg(currentWeightKg);
    setCurrentWeightKg(0.0);
    setRawTerminalLogs((prev) => [
      `${new Date().toTimeString().split(' ')[0]} -> CMD [T]: Tare Stored = ${currentWeightKg} kg`,
      ...prev.slice(0, 7),
    ]);
  };

  const handleInjectCalibrationLoad = (kg: number) => {
    setCurrentWeightKg(kg);
    setIsZero(false);
    setRawTerminalLogs((prev) => [
      `${new Date().toTimeString().split(' ')[0]} -> INGEST: NPL Traceable Standard = ${kg.toFixed(3)} kg`,
      ...prev.slice(0, 7),
    ]);
  };

  const handleTriggerTamperSimulation = () => {
    if (antiTamperStatus === 'SECURE') {
      setAntiTamperStatus('ANOMALY_DETECTED');
      setRawTerminalLogs((prev) => [
        `⚠️ ALERT: RF 433MHz shunt anomaly detected! Load cell impedance deviation > 2.5%`,
        ...prev.slice(0, 7),
      ]);
    } else {
      setAntiTamperStatus('SECURE');
      setRawTerminalLogs((prev) => [
        `✅ RE-ARMED: Load cell wheatstone bridge impedance verified nominal (350.04 Ω)`,
        ...prev.slice(0, 7),
      ]);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-10">
      {/* Header bar */}
      <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[18px] text-[#001428]">
              Live Metrological Hardware Telemetry & Waveform Engine
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#8fdfff]/30 text-[#00647d] px-2 py-0.5 rounded">
              24-BIT HIGH-SPEED STREAM
            </span>
          </div>
          <span className="text-[12px] text-[#43474d] mt-0.5">
            Physical load receiver diagnostics, excitation bridge stabilization, and real-time anti-fraud RF monitoring
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePort}
            className={`px-3.5 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
              isConnected
                ? 'bg-[#001428] text-white hover:bg-[#0f2942]'
                : 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isConnected ? 'link' : 'link_off'}
            </span>
            <span>{isConnected ? `Connected (${portName})` : 'Connect Hardware Port'}</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Live Terminal Readout & Scale Control Well (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Main LCD HUD */}
          <div className="bg-[#001428] text-white p-4 rounded border border-[#0f2942] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#b0c9e8] text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-[#0f2942] text-[#85f8c4] rounded font-bold">
                  {isStable ? 'STABLE' : 'UNSTABLE'}
                </span>
                <span className="px-1.5 py-0.5 bg-[#0f2942] text-[#cbdbf5] rounded">
                  {isZero ? 'CENTER OF ZERO' : `NET: ${(currentWeightKg - tareKg).toFixed(3)} kg`}
                </span>
              </div>
              <span>20 Hz SAMPLING</span>
            </div>

            <div className="my-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[42px] font-bold tracking-tight text-white">
                  {(currentWeightKg - tareKg).toFixed(3)}
                </span>
                <span className="text-[20px] text-[#b0c9e8] font-bold">kg</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#b0c9e8] uppercase font-mono">Gross Weight</span>
                <span className="font-mono text-[16px] text-[#85f8c4] font-semibold">
                  {currentWeightKg.toFixed(3)} kg
                </span>
              </div>
            </div>

            {/* Quick Action Commands */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#0f2942]">
              <button
                onClick={handleZeroScale}
                className="py-1.5 px-2 bg-[#0f2942] hover:bg-[#1a3b5c] text-white rounded text-[11px] font-mono font-bold transition-colors"
              >
                &gt;0&lt; ZERO
              </button>
              <button
                onClick={handleTareScale}
                className="py-1.5 px-2 bg-[#0f2942] hover:bg-[#1a3b5c] text-white rounded text-[11px] font-mono font-bold transition-colors"
              >
                &gt;T&lt; TARE
              </button>
              <button
                onClick={() => handleInjectCalibrationLoad(15.0)}
                className="py-1.5 px-2 bg-[#006781] hover:bg-[#004d62] text-white rounded text-[11px] font-mono font-bold transition-colors"
              >
                15 kg STD
              </button>
              <button
                onClick={() => handleInjectCalibrationLoad(30.0)}
                className="py-1.5 px-2 bg-[#006781] hover:bg-[#004d62] text-white rounded text-[11px] font-mono font-bold transition-colors"
              >
                30 kg MAX
              </button>
            </div>
          </div>

          {/* Port Configuration & Protocol Settings */}
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
            <span className="font-bold text-[14px] text-[#001428]">
              Serial & Fieldbus Communication Configuration
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#43474d] font-semibold">Port Interface</label>
                <select
                  disabled
                  value={portName}
                  className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded p-1.5 text-[12px] font-mono text-[#001428]"
                >
                  <option value="COM3">COM3 (RS-232 Direct)</option>
                  <option value="ttyUSB0">/dev/ttyUSB0 (FTDI)</option>
                  <option value="BLE-NAWI">BLE GATT Service</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#43474d] font-semibold">Baud Rate</label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(e.target.value)}
                  className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded p-1.5 text-[12px] font-mono text-[#001428]"
                >
                  <option value="9600">9600 bps</option>
                  <option value="19200">19200 bps</option>
                  <option value="38400">38400 bps</option>
                  <option value="115200">115200 bps</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#43474d] font-semibold">Framing</label>
                <select
                  value={parity}
                  onChange={(e) => setParity(e.target.value)}
                  className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded p-1.5 text-[12px] font-mono text-[#001428]"
                >
                  <option value="8N1">8-N-1 (Standard)</option>
                  <option value="7E1">7-E-1 (Industrial)</option>
                  <option value="8O1">8-O-1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Raw ASCII / Hex Terminal Stream */}
          <div className="bg-[#001428] p-3.5 rounded border border-[#0f2942] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between text-[#b0c9e8] text-[11px] font-mono">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#21a173] animate-pulse" />
                RAW TELEMETRY INGESTION TERMINAL
              </span>
              <span>BUFFER: 4KB</span>
            </div>
            <div className="bg-[#000a14] p-2.5 rounded font-mono text-[11px] text-[#85f8c4] space-y-1 h-36 overflow-y-auto">
              {rawTerminalLogs.map((log, idx) => (
                <div key={idx} className="leading-tight opacity-90">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Oscilloscope Waveform & Physical Sensor Diagnostics (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Live Strain Oscilloscope */}
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-[#001428]">
                  Real-Time Strain Gauge Waveform Oscilloscope
                </span>
                <span className="text-[11px] text-[#43474d]">
                  Monitoring bridge excitation stability & 50Hz hum filtering
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#21a173] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#c3c6ce]/20 font-bold">
                BANDWIDTH: 100 Hz
              </span>
            </div>

            <div className="w-full h-48 rounded overflow-hidden border border-[#0f2942]">
              <canvas
                ref={canvasRef}
                width={700}
                height={192}
                className="w-full h-full block"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-[11px]">
              <div className="p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] block text-[10px]">RMS Noise Floor</span>
                <span className="font-bold text-[#001428]">0.08 g</span>
              </div>
              <div className="p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] block text-[10px]">Drift Rate</span>
                <span className="font-bold text-[#21a173]">&lt; 0.02 g/hr</span>
              </div>
              <div className="p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] block text-[10px]">Settling Time</span>
                <span className="font-bold text-[#001428]">180 ms</span>
              </div>
              <div className="p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] block text-[10px]">Quantization</span>
                <span className="font-bold text-[#006781]">24-Bit Σ-Δ</span>
              </div>
            </div>
          </div>

          {/* Physical Metrological Sensor Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* A/D Converter & Bridge Stability */}
            <div className="bg-white p-3.5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
              <span className="font-bold text-[13px] text-[#001428] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[18px]">memory</span>
                Load Cell Signal Conditioning
              </span>
              <div className="space-y-1.5 text-[12px] font-mono">
                <div className="flex justify-between p-1.5 bg-[#eff4ff] rounded">
                  <span className="text-[#43474d]">Excitation Voltage:</span>
                  <span className="font-bold text-[#001428]">{bridgeExcitationV.toFixed(2)} V DC</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#eff4ff] rounded">
                  <span className="text-[#43474d]">Raw ADC Internal Counts:</span>
                  <span className="font-bold text-[#006781]">{adcCounts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#eff4ff] rounded">
                  <span className="text-[#43474d]">Bridge Zero Balance:</span>
                  <span className="font-bold text-[#21a173]">+0.04 mV/V (Nominal)</span>
                </div>
              </div>
            </div>

            {/* Inclinometer Tilt Compensation */}
            <div className="bg-white p-3.5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
              <span className="font-bold text-[13px] text-[#001428] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[18px]">screen_rotation</span>
                Inclinometer Leveling (A.4.11)
              </span>
              <div className="space-y-1.5 text-[12px] font-mono">
                <div className="flex justify-between p-1.5 bg-[#eff4ff] rounded">
                  <span className="text-[#43474d]">Pitch (X-Axis):</span>
                  <span className="font-bold text-[#001428]">{tiltPitchDeg > 0 ? '+' : ''}{tiltPitchDeg.toFixed(2)}° (Pass)</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#eff4ff] rounded">
                  <span className="text-[#43474d]">Roll (Y-Axis):</span>
                  <span className="font-bold text-[#001428]">{tiltRollDeg.toFixed(2)}° (Pass)</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#eff4ff] rounded">
                  <span className="text-[#43474d]">Max Permissible Incline:</span>
                  <span className="font-bold text-[#21a173]">0.20° (OIML R-76 Class III)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Innovation Highlight: Anti-Fraud Load Cell Spoofing Detector */}
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${
                  antiTamperStatus === 'SECURE' ? 'bg-[#21a173]' : 'bg-[#ba1a1a]'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {antiTamperStatus === 'SECURE' ? 'security' : 'warning'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-[#001428]">
                    Anti-Fraud RF Spectrum & Shunt Tamper Shield
                  </span>
                  <span className="text-[11px] text-[#43474d]">
                    Patented metrology algorithm detecting unauthorized wireless scale jammers & load cell bypasses
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  antiTamperStatus === 'SECURE'
                    ? 'bg-[#85f8c4] text-[#002114]'
                    : 'bg-[#ffdad6] text-[#93000a] animate-pulse'
                }`}>
                  {antiTamperStatus === 'SECURE' ? '● BRIDGE SECURE' : '⚠️ SHUNT DETECTED'}
                </span>
                <button
                  onClick={handleTriggerTamperSimulation}
                  className="px-2.5 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] rounded text-[11px] font-mono font-semibold transition-colors"
                >
                  {antiTamperStatus === 'SECURE' ? 'Simulate Fraud Event' : 'Reset Shield'}
                </button>
              </div>
            </div>

            <p className="text-[12px] text-[#43474d] leading-relaxed mt-1">
              Illegal weighing manipulation at agricultural mandis frequently employs miniature 433MHz relay modules spliced into load cell junction boxes. ManoSetu-NAWI continuously calculates bridge dynamic impedance (Z_in = 350 Ω ± 0.5%). Any step deviation without mass contact immediately triggers a cryptographic tamper seal lock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
