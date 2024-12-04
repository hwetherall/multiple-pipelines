import React from 'react';
import styled from 'styled-components';
import { Droppable } from '@hello-pangea/dnd';
import CompanyCard from './CompanyCard';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 220px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  padding: 8px;
`;

const CompanyList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')};
  flex-grow: 1;
  min-height: 100px;
`;

const Column = ({ 
  column, 
  companies, 
  currentPipelineId, 
  availablePipelines,
  onMoveCompany,
  onDuplicateCompany,
  currentAccess,
  onUpdateNotes,
  onDeleteCompany
}) => {
  return (
    <Container>
      <Title>{column.title}</Title>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <CompanyList
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {companies
              .filter(company => company !== undefined)
              .map((company, index) => (
                <CompanyCard 
                  key={company.id} 
                  company={company} 
                  index={index}
                  currentPipelineId={currentPipelineId}
                  availablePipelines={availablePipelines}
                  onMoveCompany={onMoveCompany}
                  onDuplicateCompany={onDuplicateCompany}
                  currentAccess={currentAccess}
                  onUpdateNotes={onUpdateNotes}
                  onDeleteCompany={onDeleteCompany}
                />
            ))}
            {provided.placeholder}
          </CompanyList>
        )}
      </Droppable>
    </Container>
  );
};

export default Column;