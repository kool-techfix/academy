const today = new Date();

const monday = new Date(today);

const day = monday.getDay();

const diff =
  day === 0 ? -6 : 1 - day;

monday.setDate(
  monday.getDate() + diff,
);

export const weekDays = Array.from(
  { length: 7 },
  (_, index) => {
    const date = new Date(monday);

    date.setDate(
      monday.getDate() + index,
    );

    return date;
  },
);