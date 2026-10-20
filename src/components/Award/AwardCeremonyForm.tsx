import React, { useState } from "react";
import { Clock, Eye, Save } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface AwardEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
  host: string;
  chiefGuest: string;
  coordinator: string;
  eventType: string;
  cost: string;
  sponsorship: string;
  participants: string[];
  description: string;
}

const AwardCeremonyForm: React.FC = () => {
  const [form, setForm] = useState<AwardEvent>({
    title: "SRM Excellence Awards 2025",
    date: "2025-08-15",
    time: "11:30 AM - 02:00 PM",
    venue: "SRM Auditorium, Main Campus",
    host: "Dr. Ravi Kumar",
    chiefGuest: "Hon. Minister of Education",
    coordinator: "Ms. Event Manager",
    eventType: "Annual Awards",
    cost: "500000",
    sponsorship: "",
    participants: ["SRM Group", "SRM Hospital", "SRM University", "SRM Tech"],
    description: "",
  });

  const coordinators = ["Ms. Event Manager", "Mr. Coordinator"];
  const eventTypes = ["Annual Awards", "Special Awards", "Honors Ceremony"];
  const participantsList = [
    "SRM Group",
    "SRM Hospital",
    "SRM University",
    "SRM Tech",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Form Data:", form);
  };

  const getParticipantsDisplay = () => {
    if (form.participants.length === 0) return "Select participants";
    return form.participants.join(", ");
  };

  return (
    <div className="">
      <div className=" bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="btn-theme p-4">
          <h2 className="text-xl font-semibold">Award Ceremony Setup</h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="SRM Excellence Awards 2025"
              />
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <DatePicker
                value={form.date}
                onChange={(d) => setForm((prev) => ({ ...prev, date: d }))}
                placeholder="Select event date"
                className="py-2.5"
              />
            </div>

            {/* Event Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="11:30 AM - 02:00 PM"
                />
                <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Event Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Venue / Platform
              </label>
              <input
                type="text"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="SRM Auditorium, Main Campus"
              />
            </div>

            {/* Host Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Host/Anchor Name
              </label>
              <input
                type="text"
                name="host"
                value={form.host}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Dr. Ravi Kumar"
              />
            </div>

            {/* Chief Guest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Guest
              </label>
              <input
                type="text"
                name="chiefGuest"
                value={form.chiefGuest}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Hon. Minister of Education"
              />
            </div>

            {/* Event Coordinator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Coordinator
              </label>
              <select
                name="coordinator"
                value={form.coordinator}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Select Coordinator</option>
                {coordinators.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Select Event Type</option>
                {eventTypes.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost Planned */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Planned (₹)
              </label>
              <input
                type="text"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="500000"
              />
            </div>

            {/* Sponsorship Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Details
              </label>
              <input
                type="text"
                name="sponsorship"
                value={form.sponsorship}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter sponsorship details, partners etc.."
              />
            </div>

            {/* Participant Tenants */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participant Tenants
              </label>
              <div className="relative">
                <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white appearance-none"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                       backgroundPosition: "right 0.5rem center",
                       backgroundRepeat: "no-repeat",
                       backgroundSize: "1.5em 1.5em",
                       paddingRight: "2.5rem",
                     }}>
                  {getParticipantsDisplay()}
                </div>
                <select
                  multiple
                  name="participants"
                  value={form.participants}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      participants: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                >
                  {participantsList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Enter host name"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <button className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Event
            </button>
            <button
              className="px-5 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
              onClick={handleSubmit}
            >
              <Save className="w-4 h-4" />
              Save Event Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwardCeremonyForm;