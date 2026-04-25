/**
 * Smart Timetable Generator Algorithm
 * Generates a conflict-free timetable based on sections, subjects, faculty, and classrooms.
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '9:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 1:00',   // Break
  '1:00 - 2:00',
  '2:00 - 3:00',
  '3:00 - 4:00',
];
const BREAK_SLOT = 3; // index of 12:00-1:00

export function generateTimetable(sections, subjects, faculty, classrooms) {
  if (!sections || !subjects || !faculty || !classrooms) {
    throw new Error('Missing required data for generation');
  }

  const timetables = {};

  // Ensure all inputs are arrays
  const safeSections = Array.isArray(sections) ? sections : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeFaculty = Array.isArray(faculty) ? faculty : [];
  const safeClassrooms = Array.isArray(classrooms) ? classrooms : [];

  // Separate labs and regular subjects
  const labSubjects = safeSubjects.filter(s => s && s.isLab);
  const regularSubjects = safeSubjects.filter(s => s && !s.isLab);

  // Separate lab rooms and regular rooms
  const labRooms = safeClassrooms.filter(c => c && c.roomNumber && c.roomNumber.toLowerCase().includes('lab'));
  const regularRooms = safeClassrooms.filter(c => c && c.roomNumber && !c.roomNumber.toLowerCase().includes('lab'));

  // Track global assignments to avoid conflicts
  const globalFacultySlots = {};
  const globalRoomSlots = {};

  for (const section of safeSections) {
    const sectionName = section.name || section;
    if (!sectionName) continue;

    const grid = [];

    // Track how many hours each subject has been assigned for this section
    const subjectHoursTotal = {};
    safeSubjects.forEach(s => { if (s && s.name) subjectHoursTotal[s.name] = 0; });

    for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
      const daySlots = [];
      // Track subject hours assigned on THIS specific day for this section
      const subjectHoursToday = {};
      safeSubjects.forEach(s => { if (s && s.name) subjectHoursToday[s.name] = 0; });

      for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
        // Break slot
        if (slotIdx === BREAK_SLOT) {
          daySlots.push({ subject: 'BREAK', isBreak: true });
          continue;
        }

        const slotKey = `${dayIdx}-${slotIdx}`;
        if (!globalFacultySlots[slotKey]) globalFacultySlots[slotKey] = new Set();
        if (!globalRoomSlots[slotKey]) globalRoomSlots[slotKey] = new Set();

        let assigned = false;

        // Shuffle subjects to add variety
        const shuffledSubjects = [...regularSubjects, ...labSubjects].sort(() => Math.random() - 0.5);

        for (const subj of shuffledSubjects) {
          if (!subj || !subj.name) continue;

          // REALISTIC CONSTRAINT 1: Max total hours per week
          const maxHoursWeek = subj.hoursPerWeek || 4;
          if (subjectHoursTotal[subj.name] >= maxHoursWeek) continue;

          // REALISTIC CONSTRAINT 2: Max hours per day (usually 1 for regular, 2-3 for labs)
          const maxHoursDay = subj.isLab ? 3 : 1;
          if (subjectHoursToday[subj.name] >= maxHoursDay) continue;

          // Find matching faculty
          const matchingFaculty = safeFaculty.filter(f => {
            if (!f || !f.subject || !f.name) return false;
            const fSubj = f.subject.toLowerCase();
            const sName = subj.name.toLowerCase();
            return fSubj.includes(sName) || sName.includes(fSubj);
          });

          if (matchingFaculty.length === 0) continue;

          // Find free faculty
          const freeFaculty = matchingFaculty.filter(f => !globalFacultySlots[slotKey].has(f.name));
          if (freeFaculty.length === 0) continue;

          const selectedFaculty = freeFaculty[0];

          // Find a room
          let room = null;
          if (subj.isLab && labRooms.length > 0) {
            room = labRooms.find(r => !globalRoomSlots[slotKey].has(r.roomNumber)) || null;
          }
          if (!room && regularRooms.length > 0) {
            room = regularRooms.find(r => !globalRoomSlots[slotKey].has(r.roomNumber)) || null;
          }
          if (!room && safeClassrooms.length > 0) {
            room = safeClassrooms.find(r => !globalRoomSlots[slotKey].has(r.roomNumber)) || null;
          }

          if (selectedFaculty && room) {
            daySlots.push({
              subject: subj.name,
              faculty: selectedFaculty.name,
              room: room.roomNumber,
              isLab: !!subj.isLab,
            });

            subjectHoursTotal[subj.name]++;
            subjectHoursToday[subj.name]++;
            globalFacultySlots[slotKey].add(selectedFaculty.name);
            globalRoomSlots[slotKey].add(room.roomNumber);
            assigned = true;
            break;
          }
        }

        // REALISTIC CONSTRAINT 3: Instead of mandatory activity every time, 
        // allow some Free Periods or Library/Seminar to keep it balanced.
        if (!assigned) {
          const fillers = [
            { subject: 'Free Period', faculty: '', room: '', isFree: true },
            { subject: 'Library', faculty: 'Librarian', room: 'Central Library', isFiller: true },
            { subject: 'Soft Skills', faculty: 'Trainer', room: 'Seminar Hall', isFiller: true },
            { subject: 'Free Period', faculty: '', room: '', isFree: true },
          ];
          const filler = fillers[(dayIdx + slotIdx) % fillers.length];
          daySlots.push(filler);
        }
      }

      grid.push(daySlots);
    }

    timetables[sectionName] = grid;
  }

  return timetables;
}

export { DAYS, TIME_SLOTS, BREAK_SLOT };
