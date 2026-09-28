import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Check, 
  Eye, 
  X, 
  Clock 
} from 'lucide-react';
import { getCustomEnquiries, updateEnquiryStatus } from '../../services/enquiryService';
import { formatDateTime } from '../../utils/formatters';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [success, setSuccess] = useState('');

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const data = await getCustomEnquiries();
      setEnquiries(data || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEnquiryStatus(id, newStatus);
      setSuccess(`Consultation status updated to "${newStatus}"`);
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
      }
      await loadEnquiries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filtered = enquiries.filter(e => {
    const matchesSearch = !search || 
      e.customerName?.toLowerCase().includes(search.toLowerCase()) || 
      e.phone?.toLowerCase().includes(search.toLowerCase()) ||
      e.outfitType?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Bespoke Atelier Consultations
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Custom Stitching Enquiries ({enquiries.length})
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Review custom bridal blouses, half-saree designs, measurements, and customer reference sketches.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patron name, phone, outfit..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gold-200 text-xs rounded-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-charcoal-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gold-200 text-charcoal-800 text-xs py-2 px-3 rounded-sm focus:outline-none"
          >
            <option value="all">All Enquiries</option>
            <option value="New">New / Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gold-200 rounded-sm shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-gold-100 text-charcoal-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Patron & Date</th>
                <th className="py-3 px-4">Requested Outfit</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Measurements</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-charcoal-400">
                    No custom stitching enquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF8F5]/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal-900">{enq.customerName}</div>
                      <div className="text-[10px] text-charcoal-500">{enq.phone}</div>
                      <div className="text-[10px] text-charcoal-400">{formatDateTime(enq.createdAt)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-gold-900">{enq.outfitType}</div>
                      {enq.referenceImageUrl && (
                        <span className="inline-block text-[9px] bg-gold-100 text-gold-800 px-1.5 py-0.5 rounded mt-0.5 font-semibold">
                          Has Photo Reference
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-charcoal-700">
                      {enq.eventDate || 'Flexible / Not Specified'}
                    </td>

                    <td className="py-3 px-4 text-charcoal-700">
                      <span className="text-[11px] block">{enq.measurementsType}</span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={enq.status || 'New'}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2 rounded border focus:outline-none ${
                          enq.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : enq.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : enq.status === 'Contacted'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-gold-50 text-gold-900 border-gold-300'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={`https://wa.me/${enq.phone?.replace(/[^0-9]/g, '')}?text=Hello%20${enq.customerName},%20this%20is%20Hema%20Reddy%20from%20Label%20HemaReddy%20regarding%20your%20custom%20stitching%20request%20for%20${enq.outfitType}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded inline-block transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="bg-charcoal-900 hover:bg-gold-700 text-gold-100 px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gold-300 w-full max-w-xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in text-xs max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gold-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-400">Custom Consultation</span>
                <h3 className="font-serif text-xl font-normal text-charcoal-950">{selectedEnquiry.customerName}</h3>
                <span className="text-[11px] text-gold-800 font-medium">{selectedEnquiry.outfitType}</span>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-1 text-charcoal-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF8F5] rounded-sm border border-gold-100">
                <div>
                  <span className="text-charcoal-400 block">Phone / WhatsApp:</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="font-semibold text-gold-900 hover:underline">
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-charcoal-400 block">Email Address:</span>
                  <span className="text-charcoal-800">{selectedEnquiry.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">Target Event Date:</span>
                  <span className="font-medium text-charcoal-900">{selectedEnquiry.eventDate || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">Consultation Status:</span>
                  <span className="font-semibold text-gold-800">{selectedEnquiry.status || 'New'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold uppercase tracking-wider text-charcoal-800 mb-1">Measurements Method & Details:</h4>
                <div className="p-3 bg-white border border-charcoal-200 rounded-sm">
                  <div className="font-medium text-charcoal-900">{selectedEnquiry.measurementsType}</div>
                  {selectedEnquiry.measurementsNotes && (
                    <p className="text-charcoal-600 mt-2 font-mono whitespace-pre-wrap">{selectedEnquiry.measurementsNotes}</p>
                  )}
                </div>
              </div>

              {selectedEnquiry.message && (
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-charcoal-800 mb-1">Customer Vision / Message:</h4>
                  <p className="p-3 bg-white border border-charcoal-200 rounded-sm text-charcoal-700 leading-relaxed">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              {selectedEnquiry.referenceImageUrl && (
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-charcoal-800 mb-1">Uploaded Reference Sketch / Photo:</h4>
                  <div className="rounded-sm overflow-hidden border border-gold-300 max-h-72">
                    <img src={selectedEnquiry.referenceImageUrl} alt="Reference" className="w-full h-full object-contain bg-charcoal-900" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gold-200 flex justify-between items-center">
              <a
                href={`https://wa.me/${selectedEnquiry.phone?.replace(/[^0-9]/g, '')}?text=Hello%20${selectedEnquiry.customerName},%20this%20is%20Hema%20Reddy%20from%20Label%20HemaReddy%20regarding%20your%20custom%20stitching%20request.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-sm font-semibold flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="bg-charcoal-900 text-gold-100 px-4 py-2.5 rounded-sm uppercase tracking-wider font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
