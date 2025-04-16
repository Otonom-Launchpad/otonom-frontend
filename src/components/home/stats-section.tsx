import React from 'react';

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <h3 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">{value}</h3>
      <p className="mt-2 text-sm text-slate-500 sm:text-base">{label}</p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <StatItem value="$48M+" label="Total Funds Raised" />
          <StatItem value="124+" label="Projects Launched" />
          <StatItem value="38,000+" label="Community Members" />
        </div>
      </div>
    </section>
  );
}