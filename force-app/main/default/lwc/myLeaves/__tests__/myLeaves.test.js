import { createElement,wire } from 'lwc';
import MyLeaves from 'c/myLeaves';

describe('c-my-leaves', () => {
    afterEach(() => {
        // Clean up DOM after each test case
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should render the component without errors', () => {
        // Arrange
        const element = createElement('c-my-leaves', {
            is: MyLeaves,
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // Verify if the component is added to the DOM
        expect(document.body.contains(element)).toBe(true);

        // Verify the presence of the datatable
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        expect(dataTable).not.toBeNull();
    });
});
