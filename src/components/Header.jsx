import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gauge, CheckCircle, LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NotificationCenter } from '@/components/ui/NotificationCenter'

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b sticky top-0 z-40">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">SGM</h1>
            <Badge variant="outline" className="text-xs">v1.0.0</Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            Sistema Online
          </Badge>
          
          <NotificationCenter />
          <ThemeToggle />
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user.username}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header