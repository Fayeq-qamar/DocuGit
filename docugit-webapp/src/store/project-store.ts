import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Project, Section, Repository } from '@/types'

interface ProjectState {
  currentProject: Project | null
  currentRepository: Repository | null
  sections: Section[]
  isLoading: boolean
  error: string | null
}

interface ProjectActions {
  setCurrentProject: (project: Project | null) => void
  setCurrentRepository: (repository: Repository | null) => void
  setSections: (sections: Section[]) => void
  updateSection: (sectionId: string, updates: Partial<Section>) => void
  reorderSections: (startIndex: number, endIndex: number) => void
  toggleSection: (sectionId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type ProjectStore = ProjectState & ProjectActions

const initialState: ProjectState = {
  currentProject: null,
  currentRepository: null,
  sections: [],
  isLoading: false,
  error: null,
}

export const useProjectStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentProject: (project) => set({ currentProject: project }),

      setCurrentRepository: (repository) => set({ currentRepository: repository }),

      setSections: (sections) => set({ sections }),

      updateSection: (sectionId, updates) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, ...updates } : section
          ),
        })),

      reorderSections: (startIndex, endIndex) =>
        set((state) => {
          const newSections = [...state.sections]
          const [removed] = newSections.splice(startIndex, 1)
          newSections.splice(endIndex, 0, removed)

          // Update order values
          const updatedSections = newSections.map((section, index) => ({
            ...section,
            order: index,
          }))

          return { sections: updatedSections }
        }),

      toggleSection: (sectionId) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, enabled: !section.enabled }
              : section
          ),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'project-store',
    }
  )
)