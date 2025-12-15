/**
 * IntakeForm - Customer & Device Registration
 * Creates customer, registers device, and opens a ticket in one flow
 */

import { useState } from 'react';
import { apiService } from '../services/apiService';

interface IntakeFormProps {
  onComplete?: (ticketId: string) => void;
  onCancel?: () => void;
}

type Platform = 'android' | 'ios' | 'windows' | 'mac';

interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  platform: Platform;
  oem: string;
  model: string;
  serial: string;
  imei: string;
  issueSummary: string;
  notes: string;
}

const OEM_OPTIONS: Record<Platform, string[]> = {
  android: ['Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Motorola', 'LG', 'Sony', 'Huawei', 'OPPO', 'Vivo', 'Realme', 'ASUS', 'Nokia', 'Other'],
  ios: ['Apple'],
  windows: ['Microsoft', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer', 'Other'],
  mac: ['Apple'],
};

const COMMON_ISSUES = [
  'Screen cracked/damaged',
  'Battery drains quickly',
  'Not charging',
  'Water damage',
  'Software issues',
  'Speaker/microphone not working',
  'Camera not working',
  'Buttons not responsive',
  'Device locked/FRP',
  'Data recovery needed',
  'Other',
];

export function IntakeForm({ onComplete, onCancel }: IntakeFormProps) {
  const [step, setStep] = useState<'customer' | 'device' | 'issue' | 'confirm'>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    platform: 'android',
    oem: '',
    model: '',
    serial: '',
    imei: '',
    issueSummary: '',
    notes: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 'customer':
        if (!formData.customerName.trim()) {
          setError('Customer name is required');
          return false;
        }
        return true;
      case 'device':
        if (!formData.platform) {
          setError('Please select a platform');
          return false;
        }
        return true;
      case 'issue':
        if (!formData.issueSummary.trim()) {
          setError('Please describe the issue');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    
    const steps: typeof step[] = ['customer', 'device', 'issue', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: typeof step[] = ['customer', 'device', 'issue', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.customerName,
          phone: formData.customerPhone || null,
          email: formData.customerEmail || null,
        }),
      });
      
      if (!customerRes.ok) throw new Error('Failed to create customer');
      const customer = await customerRes.json();

      const deviceRes = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          platform: formData.platform,
          oem: formData.oem || null,
          model: formData.model || null,
          serial: formData.serial || null,
          imei: formData.imei || null,
        }),
      });
      
      if (!deviceRes.ok) throw new Error('Failed to register device');
      const device = await deviceRes.json();

      const ticketRes = await apiService.createTicket({
        customerId: customer.id,
        deviceId: device.id,
        issueSummary: formData.issueSummary,
        notes: formData.notes || undefined,
      });

      if (!ticketRes.success) throw new Error('Failed to create ticket');
      
      onComplete?.(ticketRes.data?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {['customer', 'device', 'issue', 'confirm'].map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
            s === step 
              ? 'bg-cyan-500 text-black' 
              : i < ['customer', 'device', 'issue', 'confirm'].indexOf(step)
                ? 'bg-cyan-500/30 text-cyan-400'
                : 'bg-gray-800 text-gray-500'
          }`}>
            {i + 1}
          </div>
          {i < 3 && (
            <div className={`w-8 h-0.5 ${
              i < ['customer', 'device', 'issue', 'confirm'].indexOf(step)
                ? 'bg-cyan-500/50'
                : 'bg-gray-800'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-900/95 border border-cyan-500/20 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400 font-mono">NEW INTAKE</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {stepIndicator}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {step === 'customer' && (
        <div className="space-y-4">
          <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-4">Customer Information</h3>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="John Smith"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Phone</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => updateField('customerPhone', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => updateField('customerEmail', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>
      )}

      {step === 'device' && (
        <div className="space-y-4">
          <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-4">Device Information</h3>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Platform *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['android', 'ios', 'windows', 'mac'] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    updateField('platform', p);
                    updateField('oem', p === 'ios' || p === 'mac' ? 'Apple' : '');
                  }}
                  className={`px-4 py-2 rounded border transition-all ${
                    formData.platform === p
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Manufacturer</label>
              <select
                value={formData.oem}
                onChange={(e) => updateField('oem', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select...</option>
                {OEM_OPTIONS[formData.platform].map((oem) => (
                  <option key={oem} value={oem}>{oem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => updateField('model', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Galaxy S24, iPhone 15, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serial}
                onChange={(e) => updateField('serial', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">IMEI</label>
              <input
                type="text"
                value={formData.imei}
                onChange={(e) => updateField('imei', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      )}

      {step === 'issue' && (
        <div className="space-y-4">
          <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-4">Issue Description</h3>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Primary Issue *</label>
            <select
              value={formData.issueSummary}
              onChange={(e) => updateField('issueSummary', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none mb-2"
            >
              <option value="">Select common issue...</option>
              {COMMON_ISSUES.map((issue) => (
                <option key={issue} value={issue}>{issue}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.issueSummary}
              onChange={(e) => updateField('issueSummary', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Or type custom issue..."
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none resize-none"
              placeholder="Customer observations, device condition, accessories included..."
            />
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-4">Confirm Intake</h3>
          
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="text-white">{formData.customerName}</span>
            </div>
            {formData.customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-white">{formData.customerPhone}</span>
              </div>
            )}
            {formData.customerEmail && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-white">{formData.customerEmail}</span>
              </div>
            )}
            <div className="border-t border-gray-700 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-500">Device</span>
              <span className="text-white">
                {formData.oem} {formData.model || formData.platform.toUpperCase()}
              </span>
            </div>
            {formData.serial && (
              <div className="flex justify-between">
                <span className="text-gray-500">Serial</span>
                <span className="text-white font-mono text-sm">{formData.serial}</span>
              </div>
            )}
            <div className="border-t border-gray-700 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-500">Issue</span>
              <span className="text-white">{formData.issueSummary}</span>
            </div>
            {formData.notes && (
              <div className="pt-2">
                <span className="text-gray-500 text-sm">Notes:</span>
                <p className="text-gray-300 text-sm mt-1">{formData.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={step === 'customer' ? onCancel : prevStep}
          className="px-4 py-2 border border-gray-700 text-gray-400 rounded hover:bg-gray-800 transition-colors"
        >
          {step === 'customer' ? 'Cancel' : 'Back'}
        </button>

        {step === 'confirm' ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Ticket'
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold rounded hover:bg-cyan-500/30 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default IntakeForm;
