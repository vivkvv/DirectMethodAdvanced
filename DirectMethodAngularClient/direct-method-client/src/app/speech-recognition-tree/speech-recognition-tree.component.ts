import { Component } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
    MatTreeFlatDataSource,
    MatTreeFlattener,
} from '@angular/material/tree';
import {
    SpeechRecognitionDataService,
    BaseNode,
} from '../services/speech-recognition-data-service/speech-recognition-data.service';

// interface BaseNode {
//     id: string;
//     text: string;
//     children?: BaseNode[];
// }

interface RecognitionFlatNode {
    expandable: boolean;
    text: string;
    level: number;
    id: string;
}

@Component({
    selector: 'app-speech-recognition-tree',
    templateUrl: './speech-recognition-tree.component.html',
    styleUrls: ['./speech-recognition-tree.component.css'],
})
export class SpeechRecognitionTreeComponent {
    // Tree control to manage expansion state
    treeControl: FlatTreeControl<RecognitionFlatNode>;

    // Tree flattener to transform nested node structure to flat node structure
    treeFlattener: MatTreeFlattener<BaseNode, RecognitionFlatNode>;

    // Data source for mat-tree
    dataSource: MatTreeFlatDataSource<BaseNode, RecognitionFlatNode>;

    constructor(
        private speechRecognitionDataService: SpeechRecognitionDataService
    ) {
        // Define the tree flattener
        this.treeFlattener = new MatTreeFlattener(
            this.transformer,
            (node) => node.level,
            (node) => node.expandable,
            (node) => node.children
        );

        // Initialize the tree control
        this.treeControl = new FlatTreeControl<RecognitionFlatNode>(
            (node) => node.level,
            (node) => node.expandable
        );

        // Initialize the data source
        this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
        );

        // Subscribe to data changes in the service
        this.speechRecognitionDataService.dataChange.subscribe(({ data }) => {
            this.dataSource.data = data;
        });

        // Initialize with test data
        //this.initializeTestData();
    }

    ngOnInit() {
        this.speechRecognitionDataService.dataChange.subscribe(
            ({ data, parentNode }) => {
                this.dataSource.data = data;
                if (parentNode) {
                    this.updateTreeExpansion(parentNode);
                }
            }
        );
    }

    private updateTreeExpansion(parentNode: BaseNode) {
        // Collapse all nodes
        this.treeControl.dataNodes.forEach((node) =>
            this.treeControl.collapse(node)
        );

        // Expand the parent node and its ancestors
        let currentNode = this.treeControl.dataNodes.find(
            (node) => node.id === parentNode.id
        );

        if (currentNode) {
            this.treeControl.expand(currentNode);
            // Logic to find the next ancestor node
            // This will depend on how you can identify parent nodes in your data structure
        }
    }

    // Transformer to convert nested node to flat node
    transformer = (node: BaseNode, level: number): RecognitionFlatNode => {
        return {
            id: node.id,
            text: node.text,
            level: level,
            expandable: !!node.children && node.children.length > 0,
        };
    };

    // Whether the node has children (used for 'when' condition in the template)
    hasChild = (_: number, node: RecognitionFlatNode) => node.expandable;

    // addNewNode(parentNode: BaseNode) {
    //     const newNode: BaseNode = {
    //         id: 'new_node_id',
    //         text: 'New Node',
    //         children: [],
    //     };
    //     this.speechRecognitionDataService.addNode(parentNode, newNode);
    // }
}
