import React, { useState, useEffect } from 'react';
import { Mail, Search, Check, Clock } from 'lucide-react';
import { getContactMessages } from '../../services/enquiryService';
import { formatDateTime } from '../../utils/formatters';

export const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const filtered = messages.filter(m => {
    return !search || 
      m.name?.toLowerCase().includes(search.toLowerCase()) || 
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Customer Relations
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Contact Submissions ({messages.length})
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            General website contact inquiries from patrons and prospective clients.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gold-200 rounded-sm shadow-card p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-400 space-y-2">
            <Mail className="w-8 h-8 mx-auto text-charcoal-300" />
            <p>No contact messages submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((msg) => (
              <div key={msg.id} className="p-4 bg-[#FAF8F5] border border-gold-100 rounded-sm text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-charcoal-900 text-sm">{msg.name}</span>
                    <div className="text-[11px] text-charcoal-500">
                      {msg.email} {msg.phone && `• ${msg.phone}`}
                    </div>
                  </div>
                  <div className="text-[10px] text-charcoal-400">
                    {formatDateTime(msg.createdAt)}
                  </div>
                </div>

                <div className="text-[11px] text-gold-800 font-semibold uppercase tracking-wider">
                  Subject: {msg.subject || 'General Enquiry'}
                </div>

                <p className="text-charcoal-700 bg-white p-3 rounded border border-charcoal-100 leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
