import { ChevronDown, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { INDIA_STATES } from "../utils/indiaData";

interface Props {
  onStateChange: (state: string) => void;
  onCityChange: (city: string, pincode: string) => void;
  selectedState?: string;
  selectedCity?: string;
  className?: string;
}

export default function StatesCitiesSelect({
  onStateChange,
  onCityChange,
  selectedState = "",
  selectedCity = "",
  className = "",
}: Props) {
  const [stateQuery, setStateQuery] = useState(selectedState);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityValue, setCityValue] = useState(selectedCity);
  const stateRef = useRef<HTMLDivElement>(null);

  const filteredStates = INDIA_STATES.filter((s) =>
    s.name.toLowerCase().includes(stateQuery.toLowerCase()),
  );

  const selectedStateObj = INDIA_STATES.find((s) => s.name === selectedState);

  useEffect(() => {
    setStateQuery(selectedState);
  }, [selectedState]);

  useEffect(() => {
    setCityValue(selectedCity);
  }, [selectedCity]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStateSelect = (name: string) => {
    setStateQuery(name);
    setStateOpen(false);
    setCityValue("");
    onStateChange(name);
    onCityChange("", "");
  };

  const handleClearState = () => {
    setStateQuery("");
    setCityValue("");
    onStateChange("");
    onCityChange("", "");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCityValue(val);
    if (!val) {
      onCityChange("", "");
      return;
    }
    const city = selectedStateObj?.cities.find((c) => c.name === val);
    onCityChange(val, city?.pincode || "");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* State searchable dropdown */}
      <div ref={stateRef} className="relative">
        <p className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin size={13} className="inline mr-1" />
          State
        </p>
        <div className="relative">
          <input
            type="text"
            value={stateQuery}
            onChange={(e) => {
              setStateQuery(e.target.value);
              setStateOpen(true);
            }}
            onFocus={() => setStateOpen(true)}
            placeholder="Type to search state..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {stateQuery && (
              <button
                type="button"
                onClick={handleClearState}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${stateOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
        {stateOpen && filteredStates.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredStates.map((s) => (
              <button
                key={s.name}
                type="button"
                onMouseDown={() => handleStateSelect(s.name)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors ${
                  s.name === selectedState
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        {stateOpen && filteredStates.length === 0 && stateQuery && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-400">
            No state found
          </div>
        )}
      </div>

      {/* City dropdown */}
      {selectedStateObj && (
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">City</p>
          <select
            value={cityValue}
            onChange={handleCityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select city...</option>
            {selectedStateObj.cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} — {c.pincode}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
