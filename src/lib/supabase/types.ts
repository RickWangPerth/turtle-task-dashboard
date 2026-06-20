export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          role: "admin" | "developer" | "team" | "viewer";
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          role?: "admin" | "developer" | "team" | "viewer";
          created_at?: string;
        };
        Update: {
          email?: string | null;
          display_name?: string | null;
          role?: "admin" | "developer" | "team" | "viewer";
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          task_code: string;
          title: string;
          epic: string | null;
          priority: "P1" | "P2" | "P3";
          status:
            | "Backlog"
            | "To Do"
            | "In Progress"
            | "Review/UAT"
            | "Blocked"
            | "Done";
          review_status:
            | "Needs Review"
            | "Reviewed"
            | "Needs More Info"
            | "Rejected"
            | "Duplicate";
          requester: string | null;
          owner_id: string | null;
          assignee_id: string | null;
          sprint_id: string | null;
          details: string | null;
          decision_needed: string | null;
          acceptance_criteria: string | null;
          client_comment: string | null;
          environment: "Local" | "UAT" | "PROD" | "NA";
          related_url: string | null;
          screenshot_url: string | null;
          start_date: string | null;
          due_date: string | null;
          uat_date: string | null;
          prod_date: string | null;
          version: string | null;
          commit_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_code?: string;
          title: string;
          epic?: string | null;
          priority?: "P1" | "P2" | "P3";
          status?:
            | "Backlog"
            | "To Do"
            | "In Progress"
            | "Review/UAT"
            | "Blocked"
            | "Done";
          review_status?:
            | "Needs Review"
            | "Reviewed"
            | "Needs More Info"
            | "Rejected"
            | "Duplicate";
          requester?: string | null;
          owner_id?: string | null;
          assignee_id?: string | null;
          sprint_id?: string | null;
          details?: string | null;
          decision_needed?: string | null;
          acceptance_criteria?: string | null;
          client_comment?: string | null;
          environment?: "Local" | "UAT" | "PROD" | "NA";
          related_url?: string | null;
          screenshot_url?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          uat_date?: string | null;
          prod_date?: string | null;
          version?: string | null;
          commit_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          epic?: string | null;
          priority?: "P1" | "P2" | "P3";
          status?:
            | "Backlog"
            | "To Do"
            | "In Progress"
            | "Review/UAT"
            | "Blocked"
            | "Done";
          review_status?:
            | "Needs Review"
            | "Reviewed"
            | "Needs More Info"
            | "Rejected"
            | "Duplicate";
          requester?: string | null;
          owner_id?: string | null;
          assignee_id?: string | null;
          sprint_id?: string | null;
          details?: string | null;
          decision_needed?: string | null;
          acceptance_criteria?: string | null;
          client_comment?: string | null;
          environment?: "Local" | "UAT" | "PROD" | "NA";
          related_url?: string | null;
          screenshot_url?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          uat_date?: string | null;
          prod_date?: string | null;
          version?: string | null;
          commit_url?: string | null;
        };
        Relationships: [];
      };
      sprints: {
        Row: {
          id: string;
          name: string;
          goal: string | null;
          start_date: string | null;
          end_date: string | null;
          status: "Planning" | "Active" | "Completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          goal?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: "Planning" | "Active" | "Completed";
          created_at?: string;
        };
        Update: {
          name?: string;
          goal?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: "Planning" | "Active" | "Completed";
        };
        Relationships: [];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [];
      };
      task_status_history: {
        Row: {
          id: string;
          task_id: string;
          from_status: string | null;
          to_status: string | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          from_status?: string | null;
          to_status?: string | null;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          from_status?: string | null;
          to_status?: string | null;
          changed_by?: string | null;
          changed_at?: string;
        };
        Relationships: [];
      };
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          label: string | null;
          url: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          label?: string | null;
          url: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          label?: string | null;
          url?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
