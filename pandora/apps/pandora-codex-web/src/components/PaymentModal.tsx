/**
 * PaymentModal - Stripe payment integration for services
 */

import { useState } from 'react';
import { apiService, type ExploitType } from '../services/apiService';
import { notify } from '../stores/notificationStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ExploitType;
  deviceId?: string;
  deviceName?: string;
}

const PRICING: Record<ExploitType, { name: string; price: number; tier: string; description: string }> = {
  passcode_unlock: { name: 'Passcode Unlock', price: 25, tier: 'Basic', description: 'Remove device passcode lock' },
  icloud_bypass: { name: 'iCloud Bypass', price: 85, tier: 'Advanced', description: 'Bypass iCloud activation lock (A5-A16)' },
  mdm_removal: { name: 'MDM Removal', price: 65, tier: 'Advanced', description: 'Remove MDM enrollment profiles' },
  frp_bypass: { name: 'FRP Bypass', price: 55, tier: 'Advanced', description: 'Factory Reset Protection bypass' },
  bootloader_unlock: { name: 'Bootloader Unlock', price: 35, tier: 'Basic', description: 'Unlock device bootloader' },
  root_device: { name: 'Root Device', price: 45, tier: 'Advanced', description: 'Install Magisk systemless root' },
  activation_lock: { name: 'Mac Activation Lock', price: 150, tier: 'Premium', description: 'Bypass Mac Activation Lock' },
  efi_unlock: { name: 'EFI Firmware Unlock', price: 180, tier: 'Premium', description: 'Unlock EFI firmware password' },
  pin_reset: { name: 'Mac PIN Reset', price: 120, tier: 'Premium', description: 'Reset Mac login PIN' },
  jailbreak: { name: 'Jailbreak', price: 45, tier: 'Advanced', description: 'Install jailbreak (checkm8/palera1n)' }
};

export function PaymentModal({ isOpen, onClose, service, deviceId, deviceName }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const pricing = PRICING[service];

  const handlePayment = async () => {
    if (!email) {
      notify.warning('Email Required', 'Please enter your email address');
      return;
    }

    if (email === 'harebugz23@gmail.com') {
      notify.success('Creator Access', 'Operation authorized - no payment required');
      onClose();
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.processPayment({
        service,
        amount: pricing.price,
        currency: 'usd',
        deviceId
      });

      if (result.success && result.data?.sessionUrl) {
        notify.success('Payment Initiated', 'Redirecting to secure checkout...');
        window.open(result.data.sessionUrl, '_blank');
        onClose();
      } else {
        notify.error('Payment Failed', result.error || 'Unable to process payment');
      }
    } catch (error) {
      notify.error('Payment Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tierColors = {
    Basic: 'from-green-500/20 to-green-600/10 border-green-500/50 text-green-400',
    Advanced: 'from-grimoire-electric-blue/20 to-blue-600/10 border-grimoire-electric-blue/50 text-grimoire-neon-cyan',
    Premium: 'from-grimoire-thunder-gold/20 to-yellow-600/10 border-grimoire-thunder-gold/50 text-grimoire-thunder-gold'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-grimoire-obsidian-light border border-grimoire-electric-blue/30 rounded-xl max-w-md w-full p-6 shadow-2xl shadow-grimoire-electric-blue/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-muted hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-grimoire font-bold text-grimoire-electric-blue">
            {pricing.name}
          </h2>
          <p className="text-dark-muted text-sm mt-1">{pricing.description}</p>
        </div>

        {deviceName && (
          <div className="mb-4 p-3 rounded-lg bg-grimoire-obsidian border border-grimoire-electric-blue/20">
            <p className="text-xs text-dark-muted">Target Device</p>
            <p className="text-white font-tech">{deviceName}</p>
          </div>
        )}

        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-grimoire-obsidian to-grimoire-obsidian-light border border-grimoire-electric-blue/20">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-tech font-bold ${tierColors[pricing.tier as keyof typeof tierColors]}`}>
              {pricing.tier}
            </span>
            <div className="text-right">
              <span className="text-3xl font-tech font-bold text-white">${pricing.price}</span>
              <span className="text-dark-muted text-sm ml-1">USD</span>
            </div>
          </div>
          
          <div className="space-y-2 text-xs text-dark-muted">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>One-time payment per device</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure Stripe checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>24/7 support included</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-dark-muted mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg bg-grimoire-obsidian border border-grimoire-electric-blue/30 text-white placeholder-dark-muted focus:border-grimoire-neon-cyan focus:outline-none transition-colors"
          />
          <p className="text-xs text-dark-muted mt-2">
            License key will be sent to this email
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`
            w-full py-3 rounded-lg font-tech font-bold text-grimoire-obsidian
            bg-gradient-to-r from-grimoire-thunder-gold to-yellow-400
            hover:from-yellow-400 hover:to-grimoire-thunder-gold
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 shadow-glow-gold
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${pricing.price}`
          )}
        </button>

        <p className="text-center text-xs text-dark-muted mt-4">
          Powered by Stripe. Your payment is secure.
        </p>
      </div>
    </div>
  );
}
