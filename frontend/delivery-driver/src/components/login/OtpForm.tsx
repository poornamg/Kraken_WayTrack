// src/components/login/OtpForm.tsx - Stage A Driver OTP and Phone Sign-in Form

import React, { useState } from 'react';

export interface OtpFormProps {
  onSuccess?: () => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stage === 'phone' && phone.trim()) {
      setStage('otp');
    } else if (stage === 'otp' && otp.trim()) {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {stage === 'phone' ? (
        <div>
          <label className="block text-[13px] font-medium text-secondary mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 77 123 4567"
            className="w-full h-12 px-4 rounded-xl border border-hairline bg-surface text-black dark:text-white font-mono text-[16px] focus:outline-none focus:ring-2 focus:ring-action"
          />
        </div>
      ) : (
        <div>
          <label className="block text-[13px] font-medium text-secondary mb-1.5">
            Enter 4-digit code
          </label>
          <input
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="····"
            className="w-full h-12 px-4 rounded-xl border border-hairline bg-surface text-center text-black dark:text-white font-mono text-[24px] tracking-widest focus:outline-none focus:ring-2 focus:ring-action"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full h-12 rounded-xl bg-action text-white font-medium text-[15px] shadow-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
      >
        {stage === 'phone' ? 'Send Code' : 'Verify & Continue'}
      </button>
    </form>
  );
};

export default OtpForm;
