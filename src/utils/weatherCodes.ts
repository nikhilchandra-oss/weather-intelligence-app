export interface WeatherCodeInfo {
  code: number;
  label: string;
  category: 'clear' | 'clouds' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  isSevere: boolean;
  advice: string;
  dayIcon: string;
  nightIcon: string;
}

export const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: {
    code: 0,
    label: 'Clear Sky',
    category: 'clear',
    isSevere: false,
    advice: 'Unobstructed clear skies. Ideal for all outdoor excursions.',
    dayIcon: 'Sun',
    nightIcon: 'Moon',
  },
  1: {
    code: 1,
    label: 'Mainly Clear',
    category: 'clear',
    isSevere: false,
    advice: 'Mostly clear skies with fleeting sparse cloud cover.',
    dayIcon: 'SunDim',
    nightIcon: 'Moon',
  },
  2: {
    code: 2,
    label: 'Partly Cloudy',
    category: 'clouds',
    isSevere: false,
    advice: 'Scattered clouds and pleasant diffused sunlight.',
    dayIcon: 'CloudSun',
    nightIcon: 'CloudMoon',
  },
  3: {
    code: 3,
    label: 'Overcast',
    category: 'clouds',
    isSevere: false,
    advice: 'Dense uniform cloud ceiling. Soft ambient lighting.',
    dayIcon: 'Cloud',
    nightIcon: 'Cloud',
  },
  45: {
    code: 45,
    label: 'Foggy',
    category: 'fog',
    isSevere: false,
    advice: 'Dense surface fog reduces visibility. Exercise caution when driving.',
    dayIcon: 'CloudFog',
    nightIcon: 'CloudFog',
  },
  48: {
    code: 48,
    label: 'Depositing Rime Fog',
    category: 'fog',
    isSevere: true,
    advice: 'Freezing fog coating surfaces with ice crystals. Slippery road surfaces.',
    dayIcon: 'CloudFog',
    nightIcon: 'CloudFog',
  },
  51: {
    code: 51,
    label: 'Light Drizzle',
    category: 'drizzle',
    isSevere: false,
    advice: 'Fine misting precipitation. A light water-resistant layer is advised.',
    dayIcon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
  },
  53: {
    code: 53,
    label: 'Moderate Drizzle',
    category: 'drizzle',
    isSevere: false,
    advice: 'Persistent light rain spray. Umbrella recommended for city walks.',
    dayIcon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
  },
  55: {
    code: 55,
    label: 'Dense Drizzle',
    category: 'drizzle',
    isSevere: false,
    advice: 'Continuous dense drizzle soaking ground surfaces.',
    dayIcon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
  },
  56: {
    code: 56,
    label: 'Light Freezing Drizzle',
    category: 'drizzle',
    isSevere: true,
    advice: 'Sub-zero drizzle forming black ice. High slip hazard.',
    dayIcon: 'CloudSnow',
    nightIcon: 'CloudSnow',
  },
  57: {
    code: 57,
    label: 'Dense Freezing Drizzle',
    category: 'drizzle',
    isSevere: true,
    advice: 'Heavy freezing drizzle causing glazed road and sidewalk ice.',
    dayIcon: 'CloudSnow',
    nightIcon: 'CloudSnow',
  },
  61: {
    code: 61,
    label: 'Slight Rain',
    category: 'rain',
    isSevere: false,
    advice: 'Gentle intermittent rainfall. Keep an umbrella on hand.',
    dayIcon: 'CloudRain',
    nightIcon: 'CloudRain',
  },
  63: {
    code: 63,
    label: 'Moderate Rain',
    category: 'rain',
    isSevere: false,
    advice: 'Steady rainfall across the area. Waterproof outer layer recommended.',
    dayIcon: 'CloudRain',
    nightIcon: 'CloudRain',
  },
  65: {
    code: 65,
    label: 'Heavy Rain',
    category: 'rain',
    isSevere: true,
    advice: 'High-volume downpours. Expect surface pooling and traffic delays.',
    dayIcon: 'CloudRain',
    nightIcon: 'CloudRain',
  },
  66: {
    code: 66,
    label: 'Light Freezing Rain',
    category: 'rain',
    isSevere: true,
    advice: 'Rain freezing instantly on contact. Significant transit hazard.',
    dayIcon: 'CloudSnow',
    nightIcon: 'CloudSnow',
  },
  67: {
    code: 67,
    label: 'Heavy Freezing Rain',
    category: 'rain',
    isSevere: true,
    advice: 'Severe ice storm conditions. Avoid non-essential road travel.',
    dayIcon: 'CloudSnow',
    nightIcon: 'CloudSnow',
  },
  71: {
    code: 71,
    label: 'Slight Snow Fall',
    category: 'snow',
    isSevere: false,
    advice: 'Light snowfall dusting surfaces. Crisp winter conditions.',
    dayIcon: 'Snowflake',
    nightIcon: 'Snowflake',
  },
  73: {
    code: 73,
    label: 'Moderate Snow Fall',
    category: 'snow',
    isSevere: false,
    advice: 'Steady snow accumulation. Thermal clothing and boots required.',
    dayIcon: 'Snowflake',
    nightIcon: 'Snowflake',
  },
  75: {
    code: 75,
    label: 'Heavy Snow Fall',
    category: 'snow',
    isSevere: true,
    advice: 'Dense snowstorm with accumulating drifts and low visibility.',
    dayIcon: 'Snowflake',
    nightIcon: 'Snowflake',
  },
  77: {
    code: 77,
    label: 'Snow Grains',
    category: 'snow',
    isSevere: false,
    advice: 'Small opaque ice pellet precipitation.',
    dayIcon: 'Snowflake',
    nightIcon: 'Snowflake',
  },
  80: {
    code: 80,
    label: 'Slight Rain Showers',
    category: 'rain',
    isSevere: false,
    advice: 'Brief localized passing showers between sunny spells.',
    dayIcon: 'CloudSunRain',
    nightIcon: 'CloudMoonRain',
  },
  81: {
    code: 81,
    label: 'Moderate Rain Showers',
    category: 'rain',
    isSevere: false,
    advice: 'Sudden rain bursts. Carry rain protection.',
    dayIcon: 'CloudRain',
    nightIcon: 'CloudRain',
  },
  82: {
    code: 82,
    label: 'Violent Rain Showers',
    category: 'rain',
    isSevere: true,
    advice: 'Intense localized cloudbursts. Flash runoff possible.',
    dayIcon: 'CloudRain',
    nightIcon: 'CloudRain',
  },
  85: {
    code: 85,
    label: 'Slight Snow Showers',
    category: 'snow',
    isSevere: false,
    advice: 'Brief passing snow flurries.',
    dayIcon: 'Snowflake',
    nightIcon: 'Snowflake',
  },
  86: {
    code: 86,
    label: 'Heavy Snow Showers',
    category: 'snow',
    isSevere: true,
    advice: 'Sudden squalls with rapid snow accumulation.',
    dayIcon: 'Snowflake',
    nightIcon: 'Snowflake',
  },
  95: {
    code: 95,
    label: 'Thunderstorm',
    category: 'thunderstorm',
    isSevere: true,
    advice: 'Convective thunderstorm with lightning and gusty winds. Seek indoor shelter.',
    dayIcon: 'CloudLightning',
    nightIcon: 'CloudLightning',
  },
  96: {
    code: 96,
    label: 'Thunderstorm with Slight Hail',
    category: 'thunderstorm',
    isSevere: true,
    advice: 'Thunderstorm accompanied by small hail. Protect vehicles and stay indoors.',
    dayIcon: 'CloudLightning',
    nightIcon: 'CloudLightning',
  },
  99: {
    code: 99,
    label: 'Thunderstorm with Heavy Hail',
    category: 'thunderstorm',
    isSevere: true,
    advice: 'Severe supercell storm with damaging hail and violent downdrafts.',
    dayIcon: 'CloudLightning',
    nightIcon: 'CloudLightning',
  },
};

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  if (WEATHER_CODES[code]) {
    return WEATHER_CODES[code];
  }
  return {
    code,
    label: 'Variable Conditions',
    category: 'clouds',
    isSevere: false,
    advice: 'Check local meteorological indicators for shifting trends.',
    dayIcon: 'Cloud',
    nightIcon: 'Cloud',
  };
}

export function getUVTier(uv: number): {
  tier: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  color: string;
  advice: string;
} {
  if (uv < 3) {
    return {
      tier: 'Low',
      color: 'text-emerald-400',
      advice: 'Minimal sun hazard. No protection required for average exposure.',
    };
  }
  if (uv < 6) {
    return {
      tier: 'Moderate',
      color: 'text-amber-400',
      advice: 'Moderate exposure risk. Apply SPF 30+ sunscreen and wear sunglasses.',
    };
  }
  if (uv < 8) {
    return {
      tier: 'High',
      color: 'text-orange-400',
      advice: 'Protection essential. Seek shade during midday peak (11am - 4pm).',
    };
  }
  if (uv < 11) {
    return {
      tier: 'Very High',
      color: 'text-rose-400',
      advice: 'Extra precaution needed. Skin and eyes can burn rapidly. Avoid direct midday sun.',
    };
  }
  return {
    tier: 'Extreme',
    color: 'text-purple-400',
    advice: 'Critical danger. Unprotected skin can burn in minutes. Stay in shade or indoors.',
  };
}
