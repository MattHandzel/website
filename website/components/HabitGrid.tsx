import React from 'react';

interface Habit {
  id: string;
  date: string;
  habit_name: string;
  completed: boolean;
}

interface HabitGridProps {
  habits: Habit[];
}

// Helper to get all dates for the last N days
const getLastNDates = (days: number) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates.reverse();
};

const HabitGrid: React.FC<HabitGridProps> = ({ habits }) => {
  const habitNames = [...new Set(habits.map(h => h.habit_name))].sort();
  const dates = getLastNDates(30); // Show last 30 days

  const habitData = habits.reduce((acc, habit) => {
    const dateStr = new Date(habit.date).toISOString().split('T')[0];
    const key = `${habit.habit_name}-${dateStr}`;
    acc[key] = habit.completed;
    return acc;
  }, {} as Record<string, boolean>);

    const statusColorMap: { [key: string]: string } = {
    'true': 'bg-green',
    'false': 'bg-red',
    'undefined': 'bg-surface1',
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-surface0">
            <th className="sticky left-0 bg-surface0 p-2 text-left text-sm font-semibold text-text z-10">Habit</th>
            {dates.map(date => (
              <th key={date.toISOString()} className="p-1 text-center text-xs font-normal text-subtext1">
                <div className="flex flex-col items-center">
                  <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span>{date.getDate()}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habitNames.map(name => (
            <tr key={name} className="border-t border-border">
              <td className="sticky left-0 bg-base p-2 text-sm font-medium text-text whitespace-nowrap z-10">{name}</td>
              {dates.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const status = habitData[`${name}-${dateStr}`];
                return (
                  <td key={dateStr} className="p-1">
                    <div className="group relative flex justify-center">
                                            <div className={`w-5 h-5 rounded-sm ${statusColorMap[String(status)]}`}></div>
                      <div className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-surface2 text-text text-xs rounded shadow-lg whitespace-nowrap">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        <br />
                        Status: {status === undefined ? 'Not Tracked' : status ? 'Completed' : 'Failed'}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HabitGrid;
