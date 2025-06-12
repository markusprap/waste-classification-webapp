"use client";

import { Github, Linkedin } from "lucide-react";

export default function AboutTeamMemberCard({ member, language, showId }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 dark:border-gray-800">
      <img
        src={member.image}
        alt={member.name}
        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-emerald-100 shadow"
      />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
      {showId && (
        <span className="inline-block mb-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
          {member.id}
        </span>
      )}
      <div className="text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-2">
        {member.role[language] || member.role.en}
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        {member.description[language] || member.description.en}
      </p>
      <div className="flex space-x-3 mt-auto">
        {member.github && (
          <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <Github className="w-5 h-5" />
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 dark:hover:text-blue-400">
            <Linkedin className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );
}
