import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Spinner = ({ text = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 dark:border-primary-900" />
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>
    </motion.div>
  );
};

export default Spinner;
