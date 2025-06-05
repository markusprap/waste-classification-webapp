"use client";

import React from "react";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamMemberCard({ member, language }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 group">
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500 group-hover:from-green-500 group-hover:to-blue-600 transition-all duration-300">
        {member.image && member.image !== "/placeholder-user.jpg" ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
          />        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
              <span className="text-white text-lg font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        )}
      </div>
        <div className="p-4">
        <div className="text-xs text-green-600 dark:text-green-400 font-mono mb-1">
          {member.id}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
          {member.name}
        </h3>
        <p className="text-green-600 dark:text-green-400 font-medium mb-2 text-sm">
          {member.role[language]}
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 leading-relaxed">
          {member.description[language]}
        </p>
        
        <div className="flex space-x-2">
          {member.github && (
            <Button variant="outline" size="sm" asChild>
              <a href={member.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-3 h-3" />
              </a>
            </Button>
          )}
          {member.linkedin && (
            <Button variant="outline" size="sm" asChild>
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-3 h-3" />
              </a>
            </Button>
          )}
          {member.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${member.email}`}>
                <Mail className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
