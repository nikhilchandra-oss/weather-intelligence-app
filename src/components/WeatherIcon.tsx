import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
  SunDim,
} from 'lucide-react';
import { getWeatherCodeInfo } from '../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isDay?: boolean | number;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size,
}) => {
  const isDayBool = typeof isDay === 'number' ? isDay === 1 : isDay;
  const info = getWeatherCodeInfo(code);

  const iconProps = {
    className,
    ...(size ? { size } : {}),
  };

  switch (info.category) {
    case 'clear':
      return isDayBool ? (
        <Sun {...iconProps} className={`${className} text-amber-400`} />
      ) : (
        <Moon {...iconProps} className={`${className} text-indigo-300`} />
      );

    case 'clouds':
      if (code === 1 || code === 2) {
        return isDayBool ? (
          <CloudSun {...iconProps} className={`${className} text-amber-300`} />
        ) : (
          <CloudMoon {...iconProps} className={`${className} text-indigo-200`} />
        );
      }
      return <Cloud {...iconProps} className={`${className} text-slate-300`} />;

    case 'fog':
      return <CloudFog {...iconProps} className={`${className} text-slate-400`} />;

    case 'drizzle':
      return <CloudDrizzle {...iconProps} className={`${className} text-cyan-300`} />;

    case 'rain':
      return <CloudRain {...iconProps} className={`${className} text-sky-400`} />;

    case 'snow':
      return code >= 73 ? (
        <Snowflake {...iconProps} className={`${className} text-teal-200`} />
      ) : (
        <CloudSnow {...iconProps} className={`${className} text-teal-300`} />
      );

    case 'thunderstorm':
      return <CloudLightning {...iconProps} className={`${className} text-amber-400 animate-pulse`} />;

    default:
      return isDayBool ? (
        <SunDim {...iconProps} className={`${className} text-amber-400`} />
      ) : (
        <Moon {...iconProps} className={`${className} text-indigo-300`} />
      );
  }
};
