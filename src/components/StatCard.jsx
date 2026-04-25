import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  blue:   { bg: 'bg-primary-500',  light: 'bg-primary-50 dark:bg-primary-900/20',   icon: 'text-primary-600 dark:text-primary-400',  shadow: 'shadow-primary-500/20' },
  purple: { bg: 'bg-violet-500',   light: 'bg-violet-50 dark:bg-violet-900/20',      icon: 'text-violet-600 dark:text-violet-400',     shadow: 'shadow-violet-500/20'  },
  green:  { bg: 'bg-emerald-500',  light: 'bg-emerald-50 dark:bg-emerald-900/20',    icon: 'text-emerald-600 dark:text-emerald-400',   shadow: 'shadow-emerald-500/20' },
  orange: { bg: 'bg-orange-500',   light: 'bg-orange-50 dark:bg-orange-900/20',      icon: 'text-orange-600 dark:text-orange-400',     shadow: 'shadow-orange-500/20'  },
  rose:   { bg: 'bg-rose-500',     light: 'bg-rose-50 dark:bg-rose-900/20',          icon: 'text-rose-600 dark:text-rose-400',         shadow: 'shadow-rose-500/20'    },
  violet: { bg: 'bg-violet-500',   light: 'bg-violet-50 dark:bg-violet-900/20',      icon: 'text-violet-600 dark:text-violet-400',     shadow: 'shadow-violet-500/20'  },
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', delay = 0 }) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 ${c.light} rounded-2xl flex items-center justify-center shadow-lg ${c.shadow}`}>
          {Icon && <Icon className={`w-6 h-6 ${c.icon}`} />}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
