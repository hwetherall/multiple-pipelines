import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import styled from 'styled-components';
import Column from './components/Column';
import { initialPipelines } from './data/initialPipelines';
import { UserProvider, useUser } from './context/UserContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background: #f5f6fa;
`;

const UserControls = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: ${props => props.isAdmin ? '#e3f2fd' : '#f5f5f5'};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.isAdmin ? '#90caf9' : '#e0e0e0'};
`;

const UserBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  background-color: ${props => props.isAdmin ? '#2196f3' : '#757575'};
  color: white;
`;

const PipelineSelector = styled.div`
  margin-bottom: 20px;
  
  select {
    padding: 8px 12px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
`;

const AccessBadge = styled.span`
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  background-color: ${props => props.access === 'full' ? '#4caf50' : '#ff9800'};
  color: white;
`;

const BoardContainer = styled.div`
  display: flex;
  overflow-x: auto;
  min-height: 0;
  flex-grow: 1;
`;

function PipelineBoard() {
  const [pipelines, setPipelines] = useState(initialPipelines);
  const [currentPipelineId, setCurrentPipelineId] = useState('mainPipeline');
  const { currentUser, checkPipelineAccess, login } = useUser();
  const [linkedCompanies, setLinkedCompanies] = useState({});

  const currentPipeline = pipelines[currentPipelineId];
  const currentAccess = checkPipelineAccess(currentPipeline);

  const accessiblePipelines = Object.values(pipelines).filter(pipeline => 
    checkPipelineAccess(pipeline) !== 'none'
  );

  const onDragEnd = (result) => {
    if (currentAccess !== 'full') return;

    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = currentPipeline.columns[source.droppableId];
    const destinationColumn = currentPipeline.columns[destination.droppableId];

    const newSourceCompanyIds = Array.from(sourceColumn.companyIds);
    newSourceCompanyIds.splice(source.index, 1);

    const newDestinationCompanyIds = Array.from(destinationColumn.companyIds);
    newDestinationCompanyIds.splice(destination.index, 0, draggableId);

    const newPipeline = {
      ...currentPipeline,
      columns: {
        ...currentPipeline.columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          companyIds: newSourceCompanyIds,
        },
        [destinationColumn.id]: {
          ...destinationColumn,
          companyIds: newDestinationCompanyIds,
        },
      },
    };

    setPipelines({
      ...pipelines,
      [currentPipelineId]: newPipeline,
    });
  };

  const handleMoveCompany = (companyId, sourcePipelineId, targetPipelineId) => {
    if (checkPipelineAccess(pipelines[sourcePipelineId]) !== 'full' ||
        checkPipelineAccess(pipelines[targetPipelineId]) !== 'full') {
      return;
    }
    
    const company = pipelines[sourcePipelineId].companies[companyId];
    
    setPipelines(prevPipelines => {
      const newSourcePipeline = {
        ...prevPipelines[sourcePipelineId],
        companies: { ...prevPipelines[sourcePipelineId].companies },
        columns: { ...prevPipelines[sourcePipelineId].columns }
      };
      const newTargetPipeline = {
        ...prevPipelines[targetPipelineId],
        companies: { ...prevPipelines[targetPipelineId].companies },
        columns: { ...prevPipelines[targetPipelineId].columns }
      };

      // Remove from source
      delete newSourcePipeline.companies[companyId];
      Object.keys(newSourcePipeline.columns).forEach(columnId => {
        newSourcePipeline.columns[columnId] = {
          ...newSourcePipeline.columns[columnId],
          companyIds: newSourcePipeline.columns[columnId].companyIds.filter(id => id !== companyId)
        };
      });

      // Add to target
      newTargetPipeline.companies[companyId] = company;
      const firstColumnId = newTargetPipeline.columnOrder[0];
      newTargetPipeline.columns[firstColumnId].companyIds.push(companyId);

      return {
        ...prevPipelines,
        [sourcePipelineId]: newSourcePipeline,
        [targetPipelineId]: newTargetPipeline,
      };
    });
  };

  const handleDuplicateCompany = (companyId, sourcePipelineId, targetPipelineId, isLinked) => {
    if (checkPipelineAccess(pipelines[targetPipelineId]) !== 'full') {
      return;
    }
    
    const sourceCompany = pipelines[sourcePipelineId].companies[companyId];
    const newCompanyId = `${companyId}-copy-${Date.now()}`;
    
    setPipelines(prevPipelines => {
      const newTargetPipeline = {
        ...prevPipelines[targetPipelineId],
        companies: {
          ...prevPipelines[targetPipelineId].companies,
          [newCompanyId]: {
            ...sourceCompany,
            id: newCompanyId,
            name: `${sourceCompany.name} (Copy)`,
          },
        },
        columns: { ...prevPipelines[targetPipelineId].columns }
      };

      const firstColumnId = newTargetPipeline.columnOrder[0];
      newTargetPipeline.columns[firstColumnId].companyIds.push(newCompanyId);

      return {
        ...prevPipelines,
        [targetPipelineId]: newTargetPipeline,
      };
    });

    if (isLinked) {
      setLinkedCompanies(prev => ({
        ...prev,
        [newCompanyId]: companyId, // Store the relationship between copy and original
      }));
    }
  };

  const handleUpdateNotes = (companyId, notes) => {
    if (currentAccess !== 'full') return;

    setPipelines(prevPipelines => {
      const updates = {};
      
      // Update the original company
      updates[currentPipelineId] = {
        ...prevPipelines[currentPipelineId],
        companies: {
          ...prevPipelines[currentPipelineId].companies,
          [companyId]: {
            ...prevPipelines[currentPipelineId].companies[companyId],
            notes: notes
          }
        }
      };

      // Update any linked copies
      Object.entries(linkedCompanies).forEach(([copyId, originalId]) => {
        if (originalId === companyId || copyId === companyId) {
          const linkedId = originalId === companyId ? copyId : originalId;
          Object.keys(prevPipelines).forEach(pipelineId => {
            if (prevPipelines[pipelineId].companies[linkedId]) {
              updates[pipelineId] = {
                ...prevPipelines[pipelineId],
                companies: {
                  ...prevPipelines[pipelineId].companies,
                  [linkedId]: {
                    ...prevPipelines[pipelineId].companies[linkedId],
                    notes: notes
                  }
                }
              };
            }
          });
        }
      });

      return {
        ...prevPipelines,
        ...updates
      };
    });
  };

  const handleDeleteCompany = (companyId) => {
    if (currentUser?.role !== 'admin') return;

    setPipelines(prevPipelines => {
      const newPipeline = {
        ...prevPipelines[currentPipelineId],
        companies: { ...prevPipelines[currentPipelineId].companies },
        columns: { ...prevPipelines[currentPipelineId].columns }
      };

      // Remove company from companies object
      delete newPipeline.companies[companyId];

      // Remove company from all columns
      Object.keys(newPipeline.columns).forEach(columnId => {
        newPipeline.columns[columnId] = {
          ...newPipeline.columns[columnId],
          companyIds: newPipeline.columns[columnId].companyIds.filter(id => id !== companyId)
        };
      });

      return {
        ...prevPipelines,
        [currentPipelineId]: newPipeline
      };
    });
  };

  return (
    <Container>
      <UserControls isAdmin={currentUser?.role === 'admin'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Current User:</span>
          <UserBadge isAdmin={currentUser?.role === 'admin'}>
            {currentUser?.name} ({currentUser?.role})
          </UserBadge>
        </div>
        <button onClick={() => login('admin123')}>Switch to Admin</button>
        <button onClick={() => login('user123')}>Switch to Regular User</button>
      </UserControls>

      <PipelineSelector>
        <select
          value={currentPipelineId}
          onChange={(e) => setCurrentPipelineId(e.target.value)}
        >
          {accessiblePipelines.map((pipeline) => (
            <option key={pipeline.id} value={pipeline.id}>
              {pipeline.name}
            </option>
          ))}
        </select>
        <AccessBadge access={currentAccess}>{currentAccess}</AccessBadge>
      </PipelineSelector>

      <BoardContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex' }}>
            {currentPipeline.columnOrder.map((columnId) => {
              const column = currentPipeline.columns[columnId];
              const companies = column.companyIds
                .map(companyId => currentPipeline.companies[companyId])
                .filter(company => company !== undefined);

              return (
                <Column
                  key={column.id}
                  column={column}
                  companies={companies}
                  currentPipelineId={currentPipelineId}
                  availablePipelines={pipelines}
                  onMoveCompany={handleMoveCompany}
                  onDuplicateCompany={handleDuplicateCompany}
                  currentAccess={currentAccess}
                  onUpdateNotes={handleUpdateNotes}
                  onDeleteCompany={handleDeleteCompany}
                />
              );
            })}
          </div>
        </DragDropContext>
      </BoardContainer>
    </Container>
  );
}

function App() {
  return (
    <UserProvider>
      <PipelineBoard />
    </UserProvider>
  );
}

export default App; 