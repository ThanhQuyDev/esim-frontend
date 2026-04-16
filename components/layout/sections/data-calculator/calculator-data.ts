// Data usage rates in MB per hour for each activity
export const DATA_RATES: Record<string, number> = {
  socialMedia: 150,
  streamingVideoQHD: 1000, // 1 GB
  streamingVideoFHD: 1000, // 1 GB
  streamingMusic: 100,
  mapNavigation: 10,
  webBrowsing: 50,
  emailsMessaging: 4,
  videoCalls: 1000, // 1 GB
  downloads: 300,
};

export interface ActivityConfig {
  key: string;
  icon: string;
  presets: number[];
}

export const ACTIVITIES: ActivityConfig[] = [
  { key: "socialMedia", icon: "smartphone", presets: [0.5, 1, 2, 3] },
  { key: "streamingVideoQHD", icon: "film", presets: [0.5, 1, 2, 3] },
  { key: "streamingVideoFHD", icon: "film", presets: [0.5, 1, 2, 3] },
  { key: "streamingMusic", icon: "music", presets: [0.5, 1, 2, 3] },
  { key: "mapNavigation", icon: "navigation", presets: [0.5, 1, 2, 3] },
  { key: "webBrowsing", icon: "globe", presets: [0.5, 1, 2, 3] },
  { key: "emailsMessaging", icon: "messageCircle", presets: [0.5, 1, 2, 3] },
  { key: "videoCalls", icon: "video", presets: [0.5, 1, 2, 3] },
  { key: "downloads", icon: "download", presets: [0.5, 1, 2, 3] },
];

export interface ProfilePreset {
  key: string;
  values: Record<string, number>;
}

export const PROFILE_PRESETS: ProfilePreset[] = [
  {
    key: "casual_browser",
    values: {
      socialMedia: 1,
      streamingVideoQHD: 0,
      streamingVideoFHD: 0,
      streamingMusic: 1,
      mapNavigation: 0.5,
      webBrowsing: 1,
      emailsMessaging: 0.5,
      videoCalls: 0,
      downloads: 0.5,
    },
  },
  {
    key: "remote_worker",
    values: {
      socialMedia: 0.5,
      streamingVideoQHD: 0,
      streamingVideoFHD: 0.5,
      streamingMusic: 1,
      mapNavigation: 0.5,
      webBrowsing: 2,
      emailsMessaging: 2,
      videoCalls: 2,
      downloads: 0.5,
    },
  },
  {
    key: "individual",
    values: {
      socialMedia: 0,
      streamingVideoQHD: 0,
      streamingVideoFHD: 0,
      streamingMusic: 0,
      mapNavigation: 0,
      webBrowsing: 0,
      emailsMessaging: 0,
      videoCalls: 0,
      downloads: 0,
    },
  },
];

export const CHART_COLORS: Record<string, string> = {
  socialMedia: "#9FCFF2",
  streamingVideoQHD: "#FF7A70",
  streamingVideoFHD: "#FFB87D",
  streamingMusic: "#72CFC2",
  mapNavigation: "#FFF500",
  webBrowsing: "#FF9BCB",
  emailsMessaging: "#C8B8FF",
  videoCalls: "#A98BFF",
  downloads: "#5A8CFF",
};

export const TABLE_ACTIVITIES = [
  { key: "socialMedia", usage: "150 MB" },
  { key: "streamingVideoQHD", usage: "1 GB" },
  { key: "streamingVideoFHD", usage: "1 GB" },
  { key: "streamingMusic", usage: "100 MB" },
  { key: "mapNavigation", usage: "10 MB" },
  { key: "webBrowsing", usage: "50 MB" },
  { key: "emailsMessaging", usage: "4 MB" },
  { key: "videoCalls", usage: "1 GB" },
  { key: "downloads", usage: "300 MB" },
];
