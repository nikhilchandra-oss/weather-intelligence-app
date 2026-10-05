import {
  DailyForecastDay,
  HourlyForecastItem,
  OpenMeteoCurrentWeather,
  TravelIntelligence,
  TravelPackingItem,
  ActivityViability,
  TransitAdvisory,
} from '../types/weather';
import { getUVTier } from './weatherCodes';

export function computeTravelIntelligence(
  current: OpenMeteoCurrentWeather,
  daily: DailyForecastDay[],
  hourly: HourlyForecastItem[],
  isMetric: boolean
): TravelIntelligence {
  // 1. Current / Next 3-day average parameters
  const next3Days = daily.slice(0, 3);
  const avgMaxTempC = isMetric
    ? next3Days.reduce((acc, d) => acc + d.tempMax, 0) / (next3Days.length || 1)
    : ((next3Days.reduce((acc, d) => acc + d.tempMax, 0) / (next3Days.length || 1)) - 32) * (5 / 9);

  const avgMinTempC = isMetric
    ? next3Days.reduce((acc, d) => acc + d.tempMin, 0) / (next3Days.length || 1)
    : ((next3Days.reduce((acc, d) => acc + d.tempMin, 0) / (next3Days.length || 1)) - 32) * (5 / 9);

  const maxPrecipProb = Math.max(...next3Days.map((d) => d.precipitationProbabilityMax || 0));
  const totalPrecipSum = next3Days.reduce((acc, d) => acc + (d.precipitationSum || 0), 0);
  const maxWindSpeed = Math.max(...next3Days.map((d) => d.windSpeedMax || 0));
  const maxWindGusts = Math.max(...next3Days.map((d) => d.windGustsMax || 0));
  const maxUV = Math.max(...next3Days.map((d) => d.uvIndexMax || 0));

  // Determine severe weather presence in next 3 days
  const hasSevereThunderstorm = next3Days.some((d) => [95, 96, 99].includes(d.weatherCode));
  const hasSnowStorm = next3Days.some((d) => [75, 86, 67, 57].includes(d.weatherCode));
  const hasContinuousRain = next3Days.filter((d) => (d.precipitationProbabilityMax || 0) > 60).length >= 2;

  // 2. Score calculation (0 - 100)
  let score = 90;

  // Temperature penalty (comfort sweet spot: 17°C - 26°C)
  if (avgMaxTempC < 0) {
    score -= 30; // severe freezing
  } else if (avgMaxTempC < 10) {
    score -= 15; // chilly
  } else if (avgMaxTempC > 36) {
    score -= 30; // extreme heat
  } else if (avgMaxTempC > 30) {
    score -= 15; // hot
  }

  // Rain penalty
  if (maxPrecipProb > 75) {
    score -= 25;
  } else if (maxPrecipProb > 45) {
    score -= 15;
  } else if (maxPrecipProb > 25) {
    score -= 8;
  }

  // Wind penalty (km/h scale or converted)
  const effectiveGustsKmh = isMetric ? maxWindGusts : maxWindGusts * 1.609;
  if (effectiveGustsKmh > 65) {
    score -= 25;
  } else if (effectiveGustsKmh > 45) {
    score -= 15;
  } else if (effectiveGustsKmh > 30) {
    score -= 5;
  }

  // Severe storms
  if (hasSevereThunderstorm) score -= 30;
  if (hasSnowStorm) score -= 35;

  score = Math.max(15, Math.min(100, Math.round(score)));

  // Verdict
  let verdict: TravelIntelligence['verdict'] = 'Favorable Conditions';
  if (score >= 82) {
    verdict = 'Prime Travel Weather';
  } else if (score >= 65) {
    verdict = 'Favorable Conditions';
  } else if (score >= 45) {
    verdict = 'Marginal Conditions';
  } else {
    verdict = 'Adverse Weather Advisory';
  }

  // Temperature Comfort Descriptor
  let tempComfort: TravelIntelligence['temperatureComfort'] = 'Ideal & Mild';
  if (avgMaxTempC < 5) tempComfort = 'Cold / Chilly';
  else if (avgMaxTempC < 16) tempComfort = 'Cool & Crisp';
  else if (avgMaxTempC <= 25) tempComfort = 'Ideal & Mild';
  else if (avgMaxTempC <= 31) tempComfort = 'Warm & Pleasant';
  else if (avgMaxTempC <= 36) tempComfort = 'Hot & Muggy';
  else tempComfort = 'Extreme Heat';

  // Executive Summary
  let summary = '';
  if (score >= 80) {
    summary = `Excellent meteorological window with mild temperatures around ${Math.round(
      next3Days[0]?.tempMax ?? 20
    )}°, minimal precipitation risks (${maxPrecipProb}%), and benign winds. Outstanding conditions for full-day city exploration and outdoor itineraries.`;
  } else if (score >= 60) {
    summary = `Generally favorable weather with ${tempComfort.toLowerCase()} daytime conditions. Keep a light backup plan for ${
      maxPrecipProb > 40 ? 'possible passing showers' : 'shifting afternoon breezes'
    }.`;
  } else if (score >= 45) {
    summary = `Marginal conditions characterized by ${
      maxPrecipProb > 50 ? 'frequent precipitation' : 'notable chill and blustery winds'
    }. Prioritize flexible indoor and sheltered outdoor itineraries with proper weather-sealed gear.`;
  } else {
    summary = `Inclement weather advisory in effect with ${
      hasSevereThunderstorm
        ? 'thunderstorm convective activity'
        : hasSnowStorm
        ? 'heavy winter precipitation and freezing surfaces'
        : 'heavy precipitation and strong wind gusts'
    }. Delay outdoor expeditions and verify local transit schedules.`;
  }

  // 3. Dynamic Packing List
  const packingList: TravelPackingItem[] = [];

  // Rain gear
  if (maxPrecipProb >= 40 || totalPrecipSum > 3) {
    packingList.push({
      name: 'Windproof Compact Umbrella',
      category: 'accessories',
      reason: `Rain probability peaks at ${maxPrecipProb}% with anticipated showers.`,
      essential: true,
    });
    packingList.push({
      name: 'Water-Resistant Outer Shell / Rain Jacket',
      category: 'clothing',
      reason: 'Guards against wet conditions without trapping perspiration.',
      essential: maxPrecipProb >= 60,
    });
    packingList.push({
      name: 'Waterproof Walking Shoes',
      category: 'footwear',
      reason: 'Prevents dampness during wet pavement or puddles.',
      essential: totalPrecipSum > 8,
    });
  }

  // Temperature based clothing
  if (avgMinTempC < 5) {
    packingList.push({
      name: 'Thermal Base Layers & Insulated Down Jacket',
      category: 'clothing',
      reason: `Low temperatures near ${Math.round(avgMinTempC)}°C require serious heat retention.`,
      essential: true,
    });
    packingList.push({
      name: 'Fleece-Lined Gloves & Knit Beanie',
      category: 'accessories',
      reason: 'Prevents rapid body heat loss in cold morning and evening hours.',
      essential: true,
    });
  } else if (avgMaxTempC < 16) {
    packingList.push({
      name: 'Mid-Weight Cardigan / Fleece Layer',
      category: 'clothing',
      reason: 'Versatile layering for cool transitional temperatures.',
      essential: true,
    });
  } else if (avgMaxTempC > 27) {
    packingList.push({
      name: 'Breathable Linen / Quick-Dry Tops',
      category: 'clothing',
      reason: 'High heat dissipation and all-day walking comfort.',
      essential: true,
    });
    packingList.push({
      name: 'Insulated Water Flask',
      category: 'accessories',
      reason: 'Maintain consistent hydration during warm sightseeing strolls.',
      essential: true,
    });
  }

  // UV & Sun safety
  if (maxUV >= 5) {
    packingList.push({
      name: 'Broad Spectrum SPF 50+ Sunscreen',
      category: 'protection',
      reason: `UV index climbs to ${maxUV} during peak midday hours.`,
      essential: true,
    });
    packingList.push({
      name: 'Polarized UV400 Sunglasses',
      category: 'protection',
      reason: 'Cuts glare and shields retinas during high solar radiation.',
      essential: true,
    });
    packingList.push({
      name: 'Wide-Brim Sun Hat or Cap',
      category: 'protection',
      reason: 'Protects scalp and face during extended daylight exposure.',
      essential: maxUV >= 7,
    });
  }

  // Footwear always needed
  packingList.push({
    name: 'Cushioned Ergonomic Walking Footwear',
    category: 'footwear',
    reason: 'Essential for high-step counts across historic pavements and trails.',
    essential: true,
  });

  // Wind gear
  if (effectiveGustsKmh > 35) {
    packingList.push({
      name: 'Windbreaker Jacket',
      category: 'clothing',
      reason: `Gusts up to ${Math.round(maxWindGusts)} ${isMetric ? 'km/h' : 'mph'} can cause noticeable chill.`,
      essential: false,
    });
  }

  // 4. Activity Viability Matrix
  const activities: ActivityViability[] = [];

  // Walking & City Exploration
  let walkScore = 95;
  if (maxPrecipProb > 50) walkScore -= 35;
  else if (maxPrecipProb > 25) walkScore -= 15;
  if (avgMaxTempC > 33 || avgMaxTempC < 2) walkScore -= 20;
  if (effectiveGustsKmh > 40) walkScore -= 15;
  activities.push({
    activity: 'City Walking & Architectural Tours',
    score: Math.max(10, Math.min(100, walkScore)),
    status: walkScore >= 75 ? 'optimal' : walkScore >= 50 ? 'moderate' : 'unfavorable',
    recommendation:
      walkScore >= 75
        ? 'Superb conditions. Ideal for pedestrian districts, public parks, and neighborhood strolls.'
        : walkScore >= 50
        ? 'Feasible with rain protection and regular cafe rest breaks.'
        : 'Challenging due to rain or blustery chill. Opt for covered arcades or hop-on transit.',
    bestWindow: '09:00 - 12:00 & 16:00 - 19:00',
  });

  // Outdoor Dining & Rooftops
  let diningScore = 90;
  if (maxPrecipProb > 30) diningScore -= 40;
  if (avgMaxTempC < 16 || avgMaxTempC > 32) diningScore -= 25;
  if (effectiveGustsKmh > 28) diningScore -= 30;
  activities.push({
    activity: 'Al Fresco Dining & Rooftop Terraces',
    score: Math.max(10, Math.min(100, diningScore)),
    status: diningScore >= 75 ? 'optimal' : diningScore >= 45 ? 'moderate' : 'unfavorable',
    recommendation:
      diningScore >= 75
        ? 'Delightful ambient temperatures and gentle air flow. Perfect for outdoor terraces.'
        : diningScore >= 45
        ? 'Check for covered verandas with radiant heaters or windbreak screens.'
        : 'Strong winds or rain make outdoor patios impractical. Reserve indoor tables.',
    bestWindow: '12:30 - 14:30 & 18:30 - 21:00',
  });

  // Hiking & Nature Trails
  let hikeScore = 90;
  if (maxPrecipProb > 40) hikeScore -= 45; // slippery mud
  if (hasSevereThunderstorm) hikeScore -= 60;
  if (avgMaxTempC > 32) hikeScore -= 30; // heat stroke
  if (avgMaxTempC < 4) hikeScore -= 25; // ice risk
  if (effectiveGustsKmh > 45) hikeScore -= 30;
  activities.push({
    activity: 'Hiking & Scenic Nature Trails',
    score: Math.max(5, Math.min(100, hikeScore)),
    status: hikeScore >= 70 ? 'optimal' : hikeScore >= 45 ? 'moderate' : 'unfavorable',
    recommendation:
      hikeScore >= 70
        ? 'Firm ground and clear visibility. Great day to tackle ridge walks and national parks.'
        : hikeScore >= 45
        ? 'Expect damp trail sections and shifting cloud cover. Stick to well-marked paths.'
        : 'Slippery trails, poor visibility, or storm risks. Postpone alpine/trail ascents.',
    bestWindow: '07:30 - 11:30',
  });

  // Photography & Golden Hours
  const todayDaily = daily[0];
  const sunriseTime = todayDaily?.sunrise ? todayDaily.sunrise.slice(11, 16) : '06:30';
  const sunsetTime = todayDaily?.sunset ? todayDaily.sunset.slice(11, 16) : '18:45';
  let photoScore = 85;
  if (hasSevereThunderstorm || maxPrecipProb > 70) photoScore -= 30;
  activities.push({
    activity: 'Golden Hour & Landscape Photography',
    score: Math.max(20, Math.min(100, photoScore)),
    status: photoScore >= 70 ? 'optimal' : 'moderate',
    recommendation: `Soft atmospheric lighting during sunrise (${sunriseTime}) and twilight sunset (${sunsetTime}).`,
    bestWindow: `${sunriseTime} ± 45m & ${sunsetTime} ± 45m`,
  });

  // Museums & Cultural Galleries (Inverse weather: best when weather is poor!)
  const museumScore = 98;
  activities.push({
    activity: 'Museums, Art Galleries & Cultural Venues',
    score: museumScore,
    status: 'optimal',
    recommendation: 'Climate-controlled sanctuary regardless of rain, heat, or cold.',
    bestWindow: 'All day (10:00 - 17:00)',
  });

  // 5. Transit & Aviation Advisories
  const transitAdvisories: TransitAdvisory[] = [];

  // Aviation
  if (effectiveGustsKmh > 55 || hasSevereThunderstorm) {
    transitAdvisories.push({
      type: 'aviation',
      riskLevel: 'high',
      title: 'Aviation Crosswind & Turbulence Advisory',
      advisory: `Wind gusts exceeding ${Math.round(maxWindGusts)} ${
        isMetric ? 'km/h' : 'mph'
      } and atmospheric instability may result in approach delays or turbulence at regional airports.`,
    });
  } else if (effectiveGustsKmh > 38) {
    transitAdvisories.push({
      type: 'aviation',
      riskLevel: 'moderate',
      title: 'Moderate Flight Turbulence Watch',
      advisory: 'Brisk upper-level winds. Minor bumpiness expected during climb and descent phases.',
    });
  } else {
    transitAdvisories.push({
      type: 'aviation',
      riskLevel: 'low',
      title: 'Smooth Flight Operations',
      advisory: 'Calm atmospheric flight conditions with favorable visibility corridors.',
    });
  }

  // Road
  if (hasSnowStorm) {
    transitAdvisories.push({
      type: 'road',
      riskLevel: 'high',
      title: 'Icy Pavements & Winter Traction Alert',
      advisory: 'Snow or freezing precipitation creates slick road surfaces. Winter tires/chains required.',
    });
  } else if (totalPrecipSum > 10 || maxPrecipProb > 70) {
    transitAdvisories.push({
      type: 'road',
      riskLevel: 'moderate',
      title: 'Hydroplaning & Wet Surface Hazard',
      advisory: 'Standing water pools and reduced braking traction. Increase follow distances.',
    });
  } else if (current.cloud_cover > 80 && current.weather_code === 45) {
    transitAdvisories.push({
      type: 'road',
      riskLevel: 'moderate',
      title: 'Dense Fog Visibility Warning',
      advisory: 'Surface fog restricts line of sight below standard limits. Engage low-beam headlights.',
    });
  } else {
    transitAdvisories.push({
      type: 'road',
      riskLevel: 'low',
      title: 'Optimal Driving Conditions',
      advisory: 'Dry asphalt and clear line of sight across all transit arteries.',
    });
  }

  // 6. Best Days in 7-day forecast
  const bestDays = daily.map((d) => {
    let dayScore = 95;
    const precipProb = d.precipitationProbabilityMax || 0;
    const dayGustsKmh = isMetric ? d.windGustsMax : d.windGustsMax * 1.609;
    const dayMaxC = isMetric ? d.tempMax : (d.tempMax - 32) * (5 / 9);

    if (precipProb > 60) dayScore -= 35;
    else if (precipProb > 30) dayScore -= 15;
    else if (precipProb > 15) dayScore -= 5;

    if (dayGustsKmh > 50) dayScore -= 20;
    else if (dayGustsKmh > 35) dayScore -= 10;

    if (dayMaxC < 0 || dayMaxC > 35) dayScore -= 20;
    else if (dayMaxC < 10 || dayMaxC > 30) dayScore -= 10;

    if ([95, 96, 99].includes(d.weatherCode)) dayScore -= 30;

    let reason = 'Clear skies and pleasant breeze.';
    if (precipProb > 50) reason = `High chance of precipitation (${precipProb}%).`;
    else if (dayScore >= 85) reason = 'Ideal outdoor temperature with negligible rain risk.';
    else if (dayGustsKmh > 40) reason = 'Breezy winds but dry conditions.';

    return {
      date: d.date,
      dayName: d.dayName,
      score: Math.max(20, Math.min(100, Math.round(dayScore))),
      reason,
    };
  });

  // Sort best days to highlight top 2
  const sortedDays = [...bestDays].sort((a, b) => b.score - a.score);

  // 7. Sun Safety
  const uvInfo = getUVTier(maxUV);

  return {
    suitabilityScore: score,
    verdict,
    executiveSummary: summary,
    temperatureComfort: tempComfort,
    packingList,
    activities,
    transitAdvisories,
    bestDays: sortedDays,
    sunSafety: {
      maxUV,
      riskTier: uvInfo.tier,
      recommendedProtection: uvInfo.advice,
      peakExposureHours: '11:00 - 15:30',
    },
  };
}
