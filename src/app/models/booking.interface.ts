export interface IStudentRegistrationRequest {
  applicationStatus: string;
  createdAt: string;
  id: string;
  rejectionReason?: string;
  selectedPlan?: {
    planName?: string;
    planType: string;
    timeSlot: string;
    startDate: string;
    endDate: string;
    slotTypeId?: string;
    rate?: number;
    startTime?: string;
    endTime?: string;
    startMinutes?: number;
    endMinutes?: number;
  };
  shift: string;
  studentEmail: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  updatedAt: string;
}
