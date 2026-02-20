import { useState } from 'react';

export interface FilterValues {
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  contributorType: string;
  party: string;
  officeType: string;
  filerType: string;
}

interface FacetedFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  showContributorFilters?: boolean;
  showCandidateFilters?: boolean;
}

const CONTRIBUTOR_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'ENTITY', label: 'Business/Organization' },
  { value: 'LAW FIRM', label: 'Law Firm' },
];

const PARTIES = [
  { value: '', label: 'All Parties' },
  { value: 'REPUBLICAN', label: 'Republican' },
  { value: 'DEMOCRAT', label: 'Democrat' },
  { value: 'LIBERTARIAN', label: 'Libertarian' },
  { value: 'GREEN', label: 'Green' },
  { value: 'INDEPENDENT', label: 'Independent' },
];

const OFFICE_TYPES = [
  { value: '', label: 'All Offices' },
  { value: 'STATEREP', label: 'State Representative' },
  { value: 'STATESEN', label: 'State Senator' },
  { value: 'GOVERNOR', label: 'Governor' },
  { value: 'LTGOVERNOR', label: 'Lt. Governor' },
  { value: 'COMPTROLLER', label: 'Comptroller' },
  { value: 'ATTYGEN', label: 'Attorney General' },
  { value: 'LANDCOMM', label: 'Land Commissioner' },
  { value: 'AGRICULTUR', label: 'Agriculture Commissioner' },
  { value: 'RRCOMM', label: 'Railroad Commissioner' },
  { value: 'STATEEDU', label: 'State Board of Education' },
  { value: 'JUSTICE_COA', label: 'Court of Appeals Justice' },
  { value: 'STATE_CHAIR', label: 'State Party Chair' },
  { value: 'PARTYCHAIRCO', label: 'Party County Chair' },
];

const FILER_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'CEC', label: 'CEC' },
  { value: 'COH', label: 'COH' },
  { value: 'DCE', label: 'DCE' },
  { value: 'GPAC', label: 'GPAC' },
];

export default function FacetedFilters({
  filters,
  onChange,
  showContributorFilters = true,
  showCandidateFilters = false,
}: FacetedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      contributorType: '',
      party: '',
      officeType: '',
      filerType: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-texas-red hover:text-red-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-texas-blue hover:text-blue-700 md:hidden"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${isExpanded || 'md:grid'} md:grid-cols-2 lg:grid-cols-4`}>
        {/* Date Range */}
        <div className={!isExpanded ? 'hidden md:block' : ''}>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent"
          />
        </div>

        <div className={!isExpanded ? 'hidden md:block' : ''}>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent"
          />
        </div>

        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Min Amount
          </label>
          <input
            type="number"
            value={filters.amountMin}
            onChange={(e) => handleChange('amountMin', e.target.value)}
            placeholder="$0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Max Amount
          </label>
          <input
            type="number"
            value={filters.amountMax}
            onChange={(e) => handleChange('amountMax', e.target.value)}
            placeholder="No limit"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent"
          />
        </div>

        {/* Contributor Type */}
        {showContributorFilters && (
          <div className={!isExpanded ? 'hidden md:block' : ''}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contributor Type
            </label>
            <select
              value={filters.contributorType}
              onChange={(e) => handleChange('contributorType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent bg-white"
            >
              {CONTRIBUTOR_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Party Filter (for candidates) */}
        {showCandidateFilters && (
          <>
            <div className={!isExpanded ? 'hidden md:block' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Party
              </label>
              <select
                value={filters.party}
                onChange={(e) => handleChange('party', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent bg-white"
              >
                {PARTIES.map((party) => (
                  <option key={party.value} value={party.value}>
                    {party.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={!isExpanded ? 'hidden md:block' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Office
              </label>
              <select
                value={filters.officeType}
                onChange={(e) => handleChange('officeType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent bg-white"
              >
                {OFFICE_TYPES.map((office) => (
                  <option key={office.value} value={office.value}>
                    {office.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={!isExpanded ? 'hidden md:block' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Filer Type
              </label>
              <select
                value={filters.filerType}
                onChange={(e) => handleChange('filerType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-texas-blue focus:border-transparent bg-white"
              >
                {FILER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
