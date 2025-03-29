import { GameRequirement } from '../types';

export const gameRequirements: GameRequirement[] = [
  {
    name: "Online FPS Games",
    requirements: {
      download: 15,
      upload: 5,
      ping: 50,
    },
    examples: ["Valorant", "CS:GO", "Apex Legends"],
    platforms: ["PC", "PlayStation", "Xbox"],
  },
  {
    name: "Battle Royale Games",
    requirements: {
      download: 20,
      upload: 5,
      ping: 60,
    },
    examples: ["Fortnite", "PUBG", "Warzone"],
    platforms: ["PC", "PlayStation", "Xbox", "Mobile"],
  },
  {
    name: "MOBA Games",
    requirements: {
      download: 10,
      upload: 3,
      ping: 100,
    },
    examples: ["Dota 2", "League of Legends", "Mobile Legends"],
    platforms: ["PC", "Mobile"],
  },
  {
    name: "Cloud Gaming",
    requirements: {
      download: 35,
      upload: 10,
      ping: 40,
    },
    examples: ["Xbox Cloud Gaming", "GeForce NOW", "PlayStation Now"],
    platforms: ["PC", "Mobile", "Smart TV"],
  },
  {
    name: "MMO Games",
    requirements: {
      download: 15,
      upload: 5,
      ping: 150,
    },
    examples: ["World of Warcraft", "Final Fantasy XIV", "Lost Ark"],
    platforms: ["PC"],
  },
  {
    name: "Racing Games",
    requirements: {
      download: 10,
      upload: 3,
      ping: 60,
    },
    examples: ["Forza Horizon", "Gran Turismo", "iRacing"],
    platforms: ["PC", "PlayStation", "Xbox"],
  }
];