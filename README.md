# Time slot booking

This is a JS script that generates a table with time slots form a simple json structure

## HTML basic structure

```html
<input type="hidden" id="tsb-result-startTime" />
<input type="hidden" id="tsb-result-endTime" />

<table id="tsb-table"></table>

<div id="tsb-block-container">
    <div id="tsb-block" tsb-slots="4">4 Children</div>
</div>

<button id="tsb-reset">Reset</button>
```

## HTML Attributes and ids

| ID                     | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `tsb-block-container`  | The container that holds the slot block. This it to know where the block has to return to when resetting. |
| `tsb-block`            | The slot block itself. This is the draggable slot selector                                                |
| `tsb-reset`            | Button that triggers a reset to default data when clicked.                                                |
| `tsb-result-endTime`   | Input for final end time                                                                                  |
| `tsb-result-startTime` | Input for final start time                                                                                |
| `tsb-table`            | The table itself where all the tours and slots are generated in                                           |

| Attribute      | Description                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| tsb-booked     | This is a slot that's already booked                                                                                              |
| tsb-data       | Holds the default data in json format                                                                                             |
| tsb-isfullhour | This slot goes from xx:45 - xx:00 and signalizes a full hour. (IMPORTANT: When a visit goes through this it doesn't work anymore) |
| tsb-non-visit  | This slot is there for consistent table structure but isn't part of the current tour                                              |
| tsb-slotindex  | Tells the slot index in the tour                                                                                                  |
| tsb-slots      | Defines how many slots should be booked. It's defined on the `tsb-table` element                                                  |
| tsb-tourindex  | Tells the slot index in the tour                                                                                                  |

## JSON structure

```json
[
    {
        title: "Tour 1",
        startTime: "2024-10-08T21:15Z",
        endTime: "2024-10-08T23:45Z",
        visits: [
            {
                startTime: "2024-10-08T21:15Z",
                endTime: "2024-10-08T21:30Z",
            },
            {
                startTime: "2024-10-08T21:45Z",
                endTime: "2024-10-08T22:45Z",
            },
        ],
    },
    {
        title: "Tour 2",
        startTime: "2024-10-08T20:15Z",
        endTime: "2024-10-08T23:00Z",
        visits: [],
    },
];
```
