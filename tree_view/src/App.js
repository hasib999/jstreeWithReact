import React, { useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTree, faFolder } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';

function TreeNode({ id, name, isRootNode, children, onAddChild, onRename, onDelete }) {
    const [newChildName, setNewChildName] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);
    

    const contextMenuId = `context-menu-${id}`;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
        const contextMenu = document.getElementById(contextMenuId);
        contextMenu.style.display = 'block';

        document.addEventListener('click', hideContextMenu);
    };

    const hideContextMenu = () => {
        const contextMenu = document.getElementById(contextMenuId);
    
        // Check if the contextMenu element exists
        if (contextMenu) {
            contextMenu.style.display = 'none';
    
            document.removeEventListener('click', hideContextMenu);
        }
    };
    

    return (
        <div className="TreeNode" id={id}>
            <div className="TreeNodeLabel" onContextMenu={handleContextMenu}>
                <span className="TreeNodeName">
                    <button className="expand-button" onClick={toggleExpand}>
                        {isExpanded ? '-' : '+'}
                    </button>&nbsp;&nbsp;
                    <span className="TreeNodeIcon">
                        <FontAwesomeIcon icon={isRootNode ? faTree : faFolder} className={isRootNode ? "green-tree" : "folder-icon"} />
                    </span>
                    &nbsp;{name}&nbsp;
                </span>
                {/* Rest of your component... */}
            </div>
            {isExpanded && (
                <ul>
                    {children.map((child, index) => (
                        <TreeNode
                            key={child.id}
                            id={child.id}
                            name={child.name}
                            children={child.children}
                            onAddChild={onAddChild}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
            <div id={contextMenuId} className="ContextMenu">
                <div className="ContextMenuOption" onClick={() => onAddChild(id, newChildName)}>
                    Add Child
                </div>
                <div className="ContextMenuOption" onClick={() => onRename(id)}>
                    Rename
                </div>
                <div className="ContextMenuOption" onClick={() => onDelete(id)}>
                    Delete
                </div>
            </div>
        </div>
    );
}
  

function App() {
    const [rootNodes, setRootNodes] = useState([
        {
          id: uuidv4(),
          name: 'Root Node',
          children: [],
          isRootNode: true, // Set this property for the root node
        },
      ]);
      

  const generateUniqueNodeId = () => {
    return `node-${uuidv4()}`;
  };

  const findNodeAndAncestors = (nodes, targetId, ancestors = []) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === targetId) {
        return { node, ancestors };
      }
      const result = findNodeAndAncestors(node.children, targetId, [...ancestors, node]);
      if (result.node) {
        return result;
      }
    }
    return { node: null, ancestors };
  };

  const handleAddChild = (targetId, newChildName) => {
    const updatedRootNodes = rootNodes.map((node) => {
      const { node: targetNode, ancestors } = findNodeAndAncestors([node], targetId);
      if (targetNode) {
        let childId = generateUniqueNodeId();
        let index = 1;
        do {
          newChildName = `New Child ${index}`;
          index++;
        } while (targetNode.children.some(child => child.name === newChildName));

        const newNode = {
          id: childId, // Generate a unique ID for the new child
          name: newChildName,
          children: [],
        };

        targetNode.children.push(newNode);
      }
      return node;
    });

    setRootNodes(updatedRootNodes);
  };

  const handleRename = (targetId) => {
    const newName = prompt('Enter a new name:', '');
    if (newName) {
      const updatedRootNodes = rootNodes.map((node) => {
        const { node: targetNode } = findNodeAndAncestors([node], targetId);
        if (targetNode) {
          targetNode.name = newName;
        }
        return node;
      });
      setRootNodes(updatedRootNodes);
    }
  };

  const handleDelete = (targetId) => {
    if (rootNodes.some(node => node.id === targetId)) {
        const updatedRootNodes = rootNodes.filter(node => node.id !== targetId);
        setRootNodes(updatedRootNodes);
    } else {
        const updatedRootNodes = rootNodes.map((node) => {
            const { node: targetNode, ancestors } = findNodeAndAncestors([node], targetId);
            if (targetNode) {
                const parent = ancestors[ancestors.length - 1];
                parent.children = parent.children.filter((child) => child.id !== targetId);
            }
            return node;
        });

        // Hide the context menu
        const contextMenu = document.getElementById(`context-menu-${targetId}`);
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }

        setRootNodes(updatedRootNodes);
    }
};

  

  const handleCreateRoot = () => {
    const newRootNode = {
      id: generateUniqueNodeId(),
      name: 'New Root Node',
      children: [],
      isRootNode: true, // Set isRootNode to true for the new root node
    };
    setRootNodes([...rootNodes, newRootNode]);
  };
  

  return (
    <div className='App'>
      <h1>Treeview</h1>
      <button onClick={handleCreateRoot}>Create New Root</button>
      <ul>
      {rootNodes.map((node, index) => (
        <TreeNode
            key={node.id}
            id={node.id}
            name={node.name}
            isRootNode={node.isRootNode} // Pass the isRootNode property
            children={node.children}
            onAddChild={handleAddChild}
            onRename={handleRename}
            onDelete={handleDelete}
        />
    ))}

      </ul>
    </div>
  );
}

export default App;
