import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Draggable } from '@hello-pangea/dnd';
import { useUser } from '../context/UserContext';

const Container = styled.div`
  position: relative;
  border: 1px solid lightgrey;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragging ? '#f8f9fa' : 'white')};
  box-shadow: ${props => (props.isDragging ? '0 2px 5px rgba(0,0,0,0.1)' : 'none')};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isExpanded ? 'white' : '#f8f9fa'};
  }
`;

const CompanyName = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const CompanyDescription = styled.div`
  font-size: 14px;
  color: #666;
`;

const MenuIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 30px;
  right: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const AdminActions = styled.div`
  padding: 8px;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
  font-size: 12px;
`;

const AdminBadge = styled.span`
  background-color: #2196f3;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  margin-left: 4px;
`;

const NotesArea = styled.div`
  margin-top: 8px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  resize: vertical;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const CompanyCard = ({ 
  company, 
  index, 
  currentPipelineId, 
  availablePipelines, 
  onMoveCompany, 
  onDuplicateCompany,
  onDeleteCompany,
  currentAccess,
  onUpdateNotes
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { checkPipelineAccess, currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(company.notes || '');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedPipelineForDuplicate, setSelectedPipelineForDuplicate] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMove = (targetPipelineId) => {
    onMoveCompany(company.id, currentPipelineId, targetPipelineId);
    setShowMenu(false);
  };

  const handleDuplicate = (targetPipelineId) => {
    setSelectedPipelineForDuplicate(targetPipelineId);
    setShowDuplicateModal(true);
    setShowMenu(false);
  };

  const handleDuplicateConfirm = (isLinked) => {
    onDuplicateCompany(company.id, currentPipelineId, selectedPipelineForDuplicate, isLinked);
    setShowDuplicateModal(false);
    setSelectedPipelineForDuplicate(null);
  };

  const accessiblePipelines = Object.entries(availablePipelines)
    .filter(([id, pipeline]) => {
      const access = checkPipelineAccess(pipeline);
      return id !== currentPipelineId && access === 'full';
    });

  // Updated to show menu for both admin and users with full access
  const canShowMenu = (currentAccess === 'full' || isAdmin) && accessiblePipelines.length > 0;

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleNotesSave = () => {
    onUpdateNotes(company.id, notes);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent card expansion when clicking menu
    setShowMenu(!showMenu);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      onDeleteCompany(company.id);
    }
    setShowMenu(false);
  };

  return (
    <>
      <Draggable draggableId={company.id} index={index}>
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            isExpanded={isExpanded}
            onClick={handleClick}
          >
            <CompanyName>
              {company.name}
              {isAdmin && <AdminBadge>Admin View</AdminBadge>}
            </CompanyName>
            <CompanyDescription>{company.description}</CompanyDescription>
            
            {canShowMenu && (
              <MenuIcon onClick={handleMenuClick}>⋮</MenuIcon>
            )}
            
            {showMenu && canShowMenu && (
              <DropdownMenu ref={menuRef}>
                {accessiblePipelines.map(([id, pipeline]) => (
                  <div key={id}>
                    <MenuItem onClick={() => handleDuplicate(id)}>
                      Copy to {pipeline.name}...
                    </MenuItem>
                    <MenuItem onClick={() => handleMove(id)}>
                      Move to {pipeline.name}
                    </MenuItem>
                  </div>
                ))}
                
                {isAdmin && (
                  <AdminActions>
                    <MenuItem onClick={handleDelete} style={{ color: '#dc3545' }}>
                      Delete Company
                    </MenuItem>
                  </AdminActions>
                )}
              </DropdownMenu>
            )}
            
            {isExpanded && (
              <>
                <NotesArea>
                  <div>Notes:</div>
                  <NotesTextarea
                    value={notes}
                    onChange={handleNotesChange}
                    onBlur={handleNotesSave}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Add notes here..."
                  />
                </NotesArea>

                <ActionsContainer onClick={(e) => e.stopPropagation()}>
                  {Object.entries(availablePipelines).map(([pipelineId, pipeline]) => (
                    pipelineId !== currentPipelineId && (
                      <React.Fragment key={pipelineId}>
                        <button
                          onClick={() => onMoveCompany(company.id, currentPipelineId, pipelineId)}
                        >
                          Move to {pipeline.name}
                        </button>
                        <button
                          onClick={() => onDuplicateCompany(company.id, currentPipelineId, pipelineId)}
                        >
                          Copy to {pipeline.name}
                        </button>
                      </React.Fragment>
                    )
                  ))}
                </ActionsContainer>
              </>
            )}
          </Container>
        )}
      </Draggable>
      
      {showDuplicateModal && (
        <>
          <Overlay onClick={() => setShowDuplicateModal(false)} />
          <Modal>
            <h3>Duplicate Company</h3>
            <p>How would you like to duplicate {company.name}?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => handleDuplicateConfirm(true)}>
                Linked Copy (Sync Notes)
              </button>
              <button onClick={() => handleDuplicateConfirm(false)}>
                Unlinked Copy (Independent Notes)
              </button>
              <button onClick={() => setShowDuplicateModal(false)}>
                Cancel
              </button>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default CompanyCard;