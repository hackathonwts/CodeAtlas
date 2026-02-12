'use client'

import { createContext } from 'react'
import { AppAbility } from '@/lib/ability'

export const AbilityContext = createContext<AppAbility | null>(null)