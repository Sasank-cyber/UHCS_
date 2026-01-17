import { User } from "../types";

export interface RegisteredUser extends User {
  password: string;
}

// Simulated Central Database Table
export const USER_REGISTRY: RegisteredUser[] = [
  // WARDENS
  {
    id: "ADM001",
    name: "Warden Mukherjee",
    role: "admin",
    password: "pass123",
    hostelBlock: "Aryabhatta-Central",
    roomNumber: "W01",
  },
  {
    id: "ADM002",
    name: "Warden Khanna",
    role: "admin",
    password: "pass123",
    hostelBlock: "Bhaskara-Central",
    roomNumber: "W02",
  },
  // STUDENTS
  {
    id: "STU101",
    name: "Rahul Sharma",
    role: "student",
    password: "pass123",
    hostelBlock: "Aryabhatta-A",
    roomNumber: "302",
  },
  {
    id: "STU102",
    name: "Priya Singh",
    role: "student",
    password: "pass123",
    hostelBlock: "Aryabhatta-A",
    roomNumber: "305",
  },
  {
    id: "STU103",
    name: "Amit Patel",
    role: "student",
    password: "pass123",
    hostelBlock: "Bhaskara-Main",
    roomNumber: "102",
  },
  {
    id: "STU104",
    name: "Sasank",
    role: "student",
    password: "pass123",
    hostelBlock: "Bhaskara-Main",
    roomNumber: "100",
  },
];

export const authenticateUser = async (
  id: string,
  password: string,
  role: "student" | "admin",
): Promise<User | null> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = USER_REGISTRY.find(
    (u) =>
      u.id.toUpperCase() === id.toUpperCase() &&
      u.password === password &&
      u.role === role,
  );

  if (!user) return null;

  // Return user object without password for security
  const { password: _, ...userProfile } = user;
  return userProfile;
};
