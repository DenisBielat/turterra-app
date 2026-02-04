"use client";

import { useState } from "react";
import { UserTurtle } from "@/types/database";
import { TurtleCard } from "./turtle-card";
import { TurtleForm } from "./turtle-form";

interface UserTurtlesProps {
  turtles: UserTurtle[];
  userId: string;
  isOwnProfile: boolean;
}

export function UserTurtles({
  turtles,
  userId,
  isOwnProfile,
}: UserTurtlesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTurtle, setEditingTurtle] = useState<UserTurtle | undefined>();

  const handleAdd = () => {
    setEditingTurtle(undefined);
    setShowForm(true);
  };

  const handleEdit = (turtle: UserTurtle) => {
    setEditingTurtle(turtle);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTurtle(undefined);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-950 font-heading">
          {isOwnProfile ? "My Turtles" : "Turtles"}
        </h2>
        {isOwnProfile && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Turtle
          </button>
        )}
      </div>

      {turtles.length === 0 ? (
        <div className="text-center py-8">
          {isOwnProfile ? (
            <>
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-gray-500 mb-1">No turtles yet</p>
              <p className="text-sm text-gray-400">
                Add your pet turtles to show them on your profile!
              </p>
            </>
          ) : (
            <p className="text-gray-500">No turtles to show.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {turtles.map((turtle) => (
            <TurtleCard
              key={turtle.id}
              turtle={turtle}
              isOwnProfile={isOwnProfile}
              onEdit={() => handleEdit(turtle)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <TurtleForm
          userId={userId}
          turtle={editingTurtle}
          onClose={handleCloseForm}
        />
      )}
    </section>
  );
}
