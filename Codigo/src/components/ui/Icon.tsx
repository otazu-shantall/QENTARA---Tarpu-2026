import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, BookOpen, CalendarDays, ChartNoAxesCombined, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CloudSun, Copy, Database, Droplets, FileText, Filter, Flame, Grid2X2, Layers, Leaf, LocateFixed, Map, MapPin, Maximize2, Menu, MessageCircle, Minus, MoreHorizontal, Plus, RotateCw, Satellite, Search, Send, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Sprout, Sun, Thermometer, Wheat, X } from 'lucide-react'

const icons = {
  overview: Grid2X2, parcels: Sprout, monitor: Layers, climate: CloudSun, rotations: RotateCw,
  data: Database, reports: FileText, arrow: ArrowRight, arrowUp: ArrowUpRight, down: ArrowDown,
  download: ArrowDownToLine, bell: Bell, help: CircleHelp, calendar: CalendarDays, check: Check,
  chevron: ChevronDown, left: ChevronLeft, right: ChevronRight, filter: Filter, layers: Layers,
  leaf: Leaf, pin: MapPin, map: Map, menu: Menu, chat: MessageCircle, minus: Minus, plus: Plus,
  search: Search, send: Send, sparkles: Sparkles, sun: Sun, temperature: Thermometer,
  water: Droplets, close: X, locate: LocateFixed, settings: Settings2, sliders: SlidersHorizontal, chart: ChartNoAxesCombined,
  wheat: Wheat, sprout: Sprout, book: BookOpen, shield: ShieldCheck, more: MoreHorizontal,
  copy: Copy, flame: Flame, satellite: Satellite, expand: Maximize2,
}
export type IconName = keyof typeof icons
export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  const Component = icons[name]
  return <Component aria-hidden="true" size={size} strokeWidth={1.65} className={className} />
}
