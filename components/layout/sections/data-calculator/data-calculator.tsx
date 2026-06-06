"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Smartphone,
  Film,
  Music,
  Navigation,
  Globe,
  MessageCircle,
  Video,
  Download,
  ChevronDown,
  RotateCcw,
  Laptop,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { ACTIVITIES, PROFILE_PRESETS, DATA_RATES } from "./calculator-data";
import { DonutChart } from "./donut-chart";

const ICON_MAP: Record<string, React.ElementType> = {
  smartphone: Smartphone,
  film: Film,
  music: Music,
  navigation: Navigation,
  globe: Globe,
  messageCircle: MessageCircle,
  video: Video,
  download: Download,
};

const PROFILE_IMAGES: Record<string, string> = {
  casual_browser:
    "https://sb.nordcdn.com/m/561afb39c07dcfb3/original/casual-browser.png",
  remote_worker:
    "https://sb.nordcdn.com/m/5528bd1aa594249d/original/remote-worker.png",
  individual:
    "https://sb.nordcdn.com/m/49ac1da760bf5d94/original/individual.png",
};

interface DataCalculatorProps {
  dict: Record<string, any>;
}

export function DataCalculator({ dict }: DataCalculatorProps) {
  const [selectedProfile, setSelectedProfile] = useState("casual_browser");
  const [values, setValues] = useState<Record<string, number>>(
    () => PROFILE_PRESETS[0].values
  );
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(true);

  const handleProfileChange = useCallback((profileKey: string) => {
    setSelectedProfile(profileKey);
    const preset = PROFILE_PRESETS.find((p) => p.key === profileKey);
    if (preset) setValues({ ...preset.values });
  }, []);

  const handlePresetClick = useCallback(
    (activityKey: string, hours: number) => {
      setValues((prev) => ({ ...prev, [activityKey]: hours }));
      if (selectedProfile !== "individual") setSelectedProfile("individual");
    },
    [selectedProfile]
  );

  const handleInputChange = useCallback(
    (activityKey: string, val: string) => {
      const num = parseFloat(val) || 0;
      const clamped = Math.min(24, Math.max(0, num));
      setValues((prev) => ({ ...prev, [activityKey]: clamped }));
      if (selectedProfile !== "individual") setSelectedProfile("individual");
    },
    [selectedProfile]
  );

  const handleReset = useCallback(() => {
    handleProfileChange("casual_browser");
  }, [handleProfileChange]);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:gap-8">
      {/* Left: Controls */}
      <div className="lg:max-w-[768px] w-full">
        <div className="flex flex-col bg-white rounded-sm max-sm:rounded-b-none p-6 max-md:px-4 gap-6">
          <p className="heading-md text-text-primary">{dict.estimateTitle}</p>
          <p className="body-md text-text-secondary">{dict.estimateSubtitle}</p>

          {/* Profile Cards */}
          <div className="bg-bg-secondary p-4 md:p-6 rounded-sm">
            {/* Mobile dropdown */}
            <div className="md:hidden">
              <button
                className="flex items-center justify-between text-left w-full body-md-medium select-none"
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              >
                {dict.pickProfile}
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${mobileDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {mobileDropdownOpen && (
                <div className="grid gap-4 mt-4">
                  {PROFILE_PRESETS.map((profile) => (
                    <ProfileCardMobile
                      key={profile.key}
                      profile={profile}
                      selected={selectedProfile === profile.key}
                      dict={dict.profiles[profile.key]}
                      onSelect={() => handleProfileChange(profile.key)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop cards */}
            <div className="hidden md:block">
              <p className="body-lg-medium text-text-primary">
                {dict.pickProfile}
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {PROFILE_PRESETS.map((profile) => (
                  <ProfileCardDesktop
                    key={profile.key}
                    profile={profile}
                    selected={selectedProfile === profile.key}
                    dict={dict.profiles[profile.key]}
                    onSelect={() => handleProfileChange(profile.key)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Activity Controls */}
          <p className="body-lg-medium text-text-primary border-b pb-6">
            {dict.selectTime}
          </p>

          {ACTIVITIES.map((activity, idx) => (
            <div key={activity.key}>
              {idx > 0 && <hr className="border-border-secondary mb-6" />}
              <ActivityControl
                activity={activity}
                value={values[activity.key] || 0}
                dict={dict.activities[activity.key]}
                onPresetClick={(h) => handlePresetClick(activity.key, h)}
                onInputChange={(v) => handleInputChange(activity.key, v)}
                otherLabel={dict.other}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Results sidebar (desktop) */}
      <div className="hidden lg:flex flex-col items-start bg-white rounded-sm p-6 flex-1 gap-6 w-full lg:w-auto lg:min-w-[320px] sticky top-24">
        <div className="flex flex-col gap-8 w-full">
          <p className="body-lg-medium text-text-primary">
            {dict.estimatedUsage}
          </p>
          <DonutChart values={values} dict={dict} />
        </div>

        <button
          onClick={handleReset}
          className="w-full text-text-primary hover:text-text-primary-on-color hover:bg-bg-dark border-md border-border-secondary rounded-full transition-colors body-md-medium px-7 py-[11px] mt-2 inline-flex gap-2 items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
          {dict.resetCalculator}
        </button>
      </div>

      {/* Mobile bottom bar */}
      <MobileBottomBar
        values={values}
        dict={dict}
        onReset={handleReset}
      />
    </div>
  );
}

/* ===== Sub-components ===== */

function ProfileCardMobile({
  profile,
  selected,
  dict,
  onSelect,
}: {
  profile: (typeof PROFILE_PRESETS)[0];
  selected: boolean;
  dict: Record<string, string>;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-3 overflow-hidden rounded-sm cursor-pointer bg-primary border-md transition-colors ${selected
          ? "border-border-focus"
          : "border-border-secondary hover:border-border-focus"
        }`}
    >
      <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-sm bg-blue-300">
        <ProfileIcon profileKey={profile.key} />
      </div>
      <div className="flex flex-col flex-1">
        <p className="body-md-medium text-text-primary">{dict.title}</p>
        <p className="body-sm text-text-tertiary">{dict.description}</p>
      </div>
      <span
        className={`flex shrink-0 justify-center items-center w-5 h-5 rounded-full border-md transition-colors ${selected
            ? "border-border-focus bg-bg-brand-yellow"
            : "border-border-secondary bg-[rgba(255,255,255,0.5)]"
          }`}
      >
        {selected && <CheckIcon />}
      </span>
      <input
        className="sr-only"
        type="radio"
        value={profile.key}
        checked={selected}
        onChange={onSelect}
        name="profileCards"
      />
    </label>
  );
}

function ProfileCardDesktop({
  profile,
  selected,
  dict,
  onSelect,
}: {
  profile: (typeof PROFILE_PRESETS)[0];
  selected: boolean;
  dict: Record<string, string>;
  onSelect: () => void;
}) {
  const imgSrc = PROFILE_IMAGES[profile.key];
  return (
    <label
      className={`flex flex-col overflow-hidden rounded-sm cursor-pointer bg-primary border-md transition-colors ${selected
          ? "border-border-focus"
          : "border-border-secondary hover:border-border-focus"
        }`}
    >
      {imgSrc && (
        <div className="hidden md:block">
          <Image
            alt={dict.title}
            src={imgSrc}
            width={213}
            height={120}
            loading="lazy"
            className="w-full h-auto"
            style={{ color: "transparent" }}
          />
        </div>
      )}
      <div className="flex flex-col gap-2 w-full p-4">
        <ProfileIcon profileKey={profile.key} size={24} />
        <p className="body-md-medium text-text-primary">{dict.title}</p>
        <p className="body-sm text-text-secondary">{dict.description}</p>
      </div>
      <input
        className="sr-only"
        type="radio"
        value={profile.key}
        checked={selected}
        onChange={onSelect}
        name="profileCardsDesktop"
      />
    </label>
  );
}

function ActivityControl({
  activity,
  value,
  dict,
  onPresetClick,
  onInputChange,
  otherLabel,
}: {
  activity: (typeof ACTIVITIES)[0];
  value: number;
  dict: Record<string, string>;
  onPresetClick: (h: number) => void;
  onInputChange: (v: string) => void;
  otherLabel: string;
}) {
  const IconComp = ICON_MAP[activity.icon] || Globe;
  const [showCustom, setShowCustom] = useState(false);
  const isPreset = activity.presets.includes(value);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-x-2">
        <IconComp className="w-6 h-6 shrink-0 mt-1 text-text-primary" />
        <div className="flex flex-col gap-1">
          <p className="body-lg-medium text-text-primary">{dict.title}</p>
          <p className="body-md text-text-secondary">{dict.description}</p>
        </div>
      </div>
      <div className="flex items-center max-md:flex-wrap gap-2 md:gap-6">
        <div className="flex items-center gap-2 flex-1 max-md:flex-wrap">
          {activity.presets.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                onPresetClick(h);
                setShowCustom(false);
              }}
              className={`inline-flex justify-center py-[6px] px-3 flex-1 basis-1/3 md:basis-1/5 border-md outline-hidden text-center rounded-full transition-colors body-sm-medium select-none whitespace-nowrap ${value === h && !showCustom
                  ? "bg-bg-blue-100 border-bg-blue-100"
                  : "border-border-secondary hover:border-border-focus"
                }`}
            >
              {h} h
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className={`inline-flex justify-center py-[6px] px-3 flex-1 md:basis-1/5 border-md outline-hidden text-center rounded-full transition-colors body-sm-medium select-none whitespace-nowrap basis-full ${showCustom || (!isPreset && value > 0)
                ? "bg-bg-blue-100 border-bg-blue-100"
                : "border-border-secondary hover:border-border-focus"
              }`}
          >
            {otherLabel}
          </button>
        </div>
        <div className="basis-full md:basis-[120px] relative">
          <input
            className="outline-hidden appearance-none border-md rounded-sm w-full px-4 text-text-primary leading-relaxed py-[11px] placeholder-text-tertiary border-border-secondary hover:border-border-focus focus:border-border-focus pr-14 bg-bg-primary"
            placeholder="0"
            min="0"
            max="24"
            step="0.5"
            autoComplete="off"
            type="number"
            value={value || ""}
            onChange={(e) => {
              onInputChange(e.target.value);
              setShowCustom(true);
            }}
          />
          <span className="absolute body-sm text-text-tertiary right-3 top-1/2 -translate-y-1/2">
            h/day
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileBottomBar({
  values,
  dict,
  onReset,
}: {
  values: Record<string, number>;
  dict: Record<string, any>;
  onReset: () => void;
}) {
  const [showResults, setShowResults] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const totalDailyMB = Object.entries(values).reduce(
    (sum, [key, hours]) => sum + hours * (DATA_RATES[key] || 0),
    0
  );
  const hasData = totalDailyMB > 0;

  const isVisible = showResults || isClosing;

  // Trigger enter animation on mount
  useEffect(() => {
    if (showResults && !isClosing) {
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById("data-calc-modal-panel");
        if (el) {
          el.classList.remove("translate-y-full");
          el.classList.add("translate-y-0");
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [showResults, isClosing]);

  const handleClose = () => {
    setIsClosing(true);
    const el = document.getElementById("data-calc-modal-panel");
    if (el) {
      el.classList.remove("translate-y-0");
      el.classList.add("translate-y-full");
    }
    setTimeout(() => {
      setShowResults(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOpen = () => {
    setShowResults(true);
  };

  return (
    <>
      {/* Fixed bottom bar - mobile only */}
      <div
        className={`fixed bottom-0 left-0 z-10 flex flex-col lg:hidden gap-3 w-full p-4 bg-bg-secondary border-t border-border-secondary transition-opacity ${hasData ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <button
          onClick={handleOpen}
          className="w-full text-center text-primary bg-bg-accent hover:bg-bg-accent-hover border-md border-bg-accent rounded-full transition-colors py-[5.5px] body-sm-medium px-6"
        >
          {dict.calculateData}
        </button>
        <button
          onClick={onReset}
          className="w-full text-text-primary hover:text-text-primary-on-color hover:bg-bg-dark border-md border-border-secondary rounded-full transition-colors body-sm-medium px-6 py-[5.5px] inline-flex gap-2 items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
          {dict.resetCalculator}
        </button>
      </div>

      {/* Mobile results modal with slide-up animation */}
      {isVisible && (
        <div
          className={`fixed inset-0 z-50 lg:hidden flex items-end transition-opacity duration-300 ${showResults && !isClosing ? "bg-black/50" : "bg-transparent"
            }`}
          onClick={handleClose}
        >
          <div
            id="data-calc-modal-panel"
            className="w-full bg-bg-primary rounded-t-lg p-6 max-h-[80vh] overflow-y-auto translate-y-full transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <p className="body-lg-medium text-text-primary">
                {dict.estimatedUsage}
              </p>
              <button
                onClick={handleClose}
                className="text-text-tertiary body-md"
              >
                ✕
              </button>
            </div>
            <DonutChart values={values} dict={dict} />
            <button
              onClick={handleClose}
              className="w-full mt-6 text-center text-primary bg-bg-accent hover:bg-bg-accent-hover rounded-full transition-colors py-3 body-md-medium"
            >
              {dict.close || "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileIcon({
  profileKey,
  size = 24,
}: {
  profileKey: string;
  size?: number;
}) {
  const icons: Record<string, React.ElementType> = {
    casual_browser: Globe,
    remote_worker: Laptop,
    individual: SlidersHorizontal,
  };
  const Icon = icons[profileKey] || Globe;
  return <Icon className={`w-${size === 24 ? 6 : 5} h-${size === 24 ? 6 : 5} text-text-primary`} />;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6L5 9L10 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
