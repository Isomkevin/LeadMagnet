import { motion } from 'framer-motion'
import { Sparkles, MousePointer, Grid3x3, StickyNote, Type, Square, Smile, MessageCircle, Plus, Undo, Redo } from 'lucide-react'

export default function Sidebar() {
  const tools = [
    { icon: Sparkles, active: true, color: 'bg-purple-100 text-purple-600' },
    { icon: MousePointer, active: false },
    { icon: Grid3x3, active: false },
    { icon: StickyNote, active: false },
    { icon: Type, active: false },
    { icon: Square, active: false },
    { icon: Smile, active: false },
    { icon: MessageCircle, active: false },
  ]

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
      {/* Tool Icons */}
      {tools.map((Tool, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            Tool.active 
              ? Tool.color 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Tool.icon className="w-5 h-5" />
        </motion.button>
      ))}

      {/* Add More */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center"
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      <div className="flex-1"></div>

      {/* Undo/Redo */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600"
      >
        <Undo className="w-5 h-5" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600"
      >
        <Redo className="w-5 h-5" />
      </motion.button>
    </div>
  )
}

