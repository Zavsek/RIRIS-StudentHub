export interface Faculty {
  id: number
  name: string
  university?: string
  location?: string
  yearFounded?: number
}

export interface Program {
  id: number
  name: string
  facultyId: number
  durationYears?: number
  level: number
}

export interface Course {
  id: number
  name: string
  programId?: number
  year?: number
  professor?: string
  ects?: number
  semester?: string
  programName?: string
}
