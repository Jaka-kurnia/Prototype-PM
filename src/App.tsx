import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { WorkflowStepper } from './components/common/WorkflowStepper';
import { ToastContainer } from './components/common/ToastContainer';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { BacklogView } from './components/backlog/BacklogView';
import { TimelineView } from './components/timeline/TimelineView';
import { TaskListView } from './components/list/TaskListView';
import { AiAutomationHub } from './components/ai/AiAutomationHub';
import { FinanceInvoicesView } from './components/finance/FinanceInvoicesView';
import { CrmDealsView } from './components/crm/CrmDealsView';
import { HrTeamView } from './components/hr/HrTeamView';
import { GithubSettingsView } from './components/settings/GithubSettingsView';
import { ClientPortalView } from './components/client/ClientPortalView';
import { TaskDetailModal } from './components/task/TaskDetailModal';
import { CreateTaskModal } from './components/task/CreateTaskModal';
import { IntakeSimulatorModal } from './components/intake/IntakeSimulatorModal';
import { Task, Invoice } from './types';

const MainApp: React.FC = () => {
  const { role, tasks, setSelectedProjectId } = useApp();

  const [activeTab, setActiveTab] = useState<string>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSelectInvoice = (invoice: Invoice) => {
    setActiveTab('finance');
  };

  const handleTaskCreatedFromIntake = (taskId: string) => {
    const createdTask = tasks.find((t) => t.id === taskId);
    if (createdTask) {
      setSelectedTask(createdTask);
    }
  };

  const handleNavigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('kanban');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-zinc-200 selection:text-zinc-900">
      {/* Linear Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateTask={() => setShowCreateTaskModal(true)}
        onOpenIntakeModal={() => setShowIntakeModal(true)}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-50">
        {/* Contextual TopBar */}
        <TopBar
          activeTab={activeTab}
          onOpenCreateTask={() => setShowCreateTaskModal(true)}
          onOpenIntakeModal={() => setShowIntakeModal(true)}
          onToggleMobileSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* PRD End-to-End Workflow Diagram Banner */}
        <WorkflowStepper
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenIntakeModal={() => setShowIntakeModal(true)}
        />

        {/* Dynamic Viewport */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-zinc-50">
          {role === 'client' && activeTab === 'kanban' ? (
            <ClientPortalView
              onSelectTask={handleSelectTask}
              onOpenIntakeModal={() => setShowIntakeModal(true)}
              onSelectInvoice={handleSelectInvoice}
            />
          ) : (
            <>
              {activeTab === 'kanban' && (
                <KanbanBoard
                  onSelectTask={handleSelectTask}
                  onOpenCreateTask={() => setShowCreateTaskModal(true)}
                />
              )}
              {activeTab === 'backlog' && (
                <BacklogView
                  onSelectTask={handleSelectTask}
                  onOpenCreateTask={() => setShowCreateTaskModal(true)}
                />
              )}
              {activeTab === 'timeline' && (
                <TimelineView onSelectTask={handleSelectTask} />
              )}
              {activeTab === 'list' && (
                <TaskListView
                  onSelectTask={handleSelectTask}
                  onOpenCreateTask={() => setShowCreateTaskModal(true)}
                />
              )}
              {activeTab === 'ai_hub' && (
                <AiAutomationHub
                  onSelectTask={handleSelectTask}
                  onOpenIntakeModal={() => setShowIntakeModal(true)}
                />
              )}
              {activeTab === 'finance' && <FinanceInvoicesView />}
              {activeTab === 'crm' && (
                <CrmDealsView 
                  onNavigateToProject={handleNavigateToProject}
                  onNavigateToSettings={() => setActiveTab('github')} 
                />
              )}
              {activeTab === 'team' && <HrTeamView />}
              {activeTab === 'github' && <GithubSettingsView />}
            </>
          )}
        </div>
      </div>

      {/* Interactive Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal onClose={() => setShowCreateTaskModal(false)} />
      )}

      {showIntakeModal && (
        <IntakeSimulatorModal
          onClose={() => setShowIntakeModal(false)}
          onTaskCreated={handleTaskCreatedFromIntake}
        />
      )}

      {/* Real-time Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
