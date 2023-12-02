import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BaseNode {
    id: string;
    text: string;
    children?: BaseNode[];
}

@Injectable({
    providedIn: 'root',
})
export class SpeechRecognitionDataService {
    public dataChange = new BehaviorSubject<{
        data: BaseNode[];
        parentNode: BaseNode | null;
    }>({ data: [], parentNode: null });

    get data(): BaseNode[] {
        return this.dataChange.value.data;
    }

    constructor() {
        // Initialize with test data or fetch data from a server
        //this.initializeTestData();
    }

    // Method to initialize test data
    // initializeTestData(): void {
    //     const initialData: BaseNode[] = [
    //         {
    //             id: 'root1',
    //             text: 'Root Node 1',
    //             children: [
    //                 {
    //                     id: 'leaf1',
    //                     text: 'Leaf Node 1 aaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbbb nnnnnnnnnnnnnnnnnnnnnnnnnnn rrrrrrrrrrrrrrrrrr bbbbbbbbbbbbbbbbbbbbbbbbbbb tttttttttttttttttttttttttt yyyyyyyyyyyy',
    //                 },
    //                 { id: 'leaf2', text: 'Leaf Node 2' },
    //                 // ... more leaf nodes
    //             ],
    //         },
    //         {
    //             id: 'root2',
    //             text: 'Root Node 2',
    //             children: [
    //                 { id: 'leaf3', text: 'Leaf Node 3' },
    //                 // ... more leaf nodes
    //             ],
    //         },
    //         // ... more root nodes
    //     ];

    //     // Set the data for the data source
    //     //this.dataSource.data = data;
    //     this.dataChange.next(initialData);
    // }

    clearData() {
      this.dataChange.value.data = []; 
      this.dataChange.next(this.dataChange.value);
    }

    addOrUpdateNode(rootID: string, childID: string, childText: string) {
        // const nodes = this.data;
        let rootNode = this.findNode(rootID);

        // If the root node doesn't exist, create it
        if (!rootNode) {
            rootNode = { id: rootID, text: rootID, children: [] };
            this.data.unshift(rootNode);
        }

        // Create and add the new child node
        const newChildNode: BaseNode = { id: childID, text: childText };
        rootNode.children = [newChildNode, ...(rootNode.children || [])];

        this.dataChange.next({ data: this.data, parentNode: rootNode });
    }

    private findNode(id: string): BaseNode | null {
        // Recursive function to find a node by id
        for (let node of this.data) {
            if (node.id === id) {
                return node;
            }
        }
        return null;
    }

    // initializeTestData() {
    //   const initialData: BaseNode[] = [
    //     // ... your initial data
    //   ];
    //   this.dataChange.next(initialData);
    // }

    // Add a new node under the parent node
    // addNode(parent: BaseNode, newNode: BaseNode) {
    //     if (parent.children) {
    //         parent.children.push(newNode);
    //     } else {
    //         parent.children = [newNode];
    //     }
    //     this.dataChange.next(this.data);
    // }

    // Update a node
    // updateNode(node: BaseNode, changes: Partial<BaseNode>) {
    //     Object.assign(node, changes);
    //     this.dataChange.next(this.data);
    // }

    // More methods like removeNode, etc., can be added here
}
