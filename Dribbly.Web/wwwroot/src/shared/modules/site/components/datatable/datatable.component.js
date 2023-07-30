(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyDatatable', {
            bindings: {
                onReady: '<'
            },
            controllerAs: 'bdt',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', '$compile', '$timeout', '$element'];
    function controllerFn($scope, $compile, $timeout, $element) {
        var bdt = this;
        var _lastRowId = 0;
        var _tableContainer;
        var _tableElement;
        var _allItems;

        bdt.$onInit = function () {

            _tableContainer = $element.find('[name="table-container"]');
            bdt.tableData = {
                rowDatas: []
            };
            var defaultOptions = {
                pagination: {
                    currentPage: 1,
                    pageSize: 10
                }
            };

            bdt.onReady({
                setData: (data) => {
                    _allItems = angular.copy(data);
                    bdt.totalItems = data.length;
                    $timeout(() => {
                        bdt.isBusy = false;
                        showPage(1);
                    }, 500); // added this delay to give the "busy indicator" time to be displayed.
                    // This makes it more obvious that the data has been reloaded, which may not be obvious
                    // when, for example, no data were loaded in consecutive calls
                },
                setOptions: (options) => {
                    bdt.options = Object.assign({}, defaultOptions, options);
                    setBusy();
                },
                setBusy: setBusy,
                removeRowData: removeRowData
            })

        };

        function setBusy() {
            bdt.isBusy = true;
            showPage(1);
        }

        function showPage(pageNumber) {
            if (!bdt.isBusy) {
                var itemsToShow = bdt.options.pagination === false ?
                    _allItems :
                    _allItems.slice(bdt.options.pagination.pageSize * (pageNumber - 1), bdt.options.pagination.pageSize * pageNumber)
                bdt.tableData.rowDatas.length = 0;

                itemsToShow.forEach(item => {
                    bdt.tableData.rowDatas.push(buildNewRowData(item));
                });
            }
            $timeout(buildComponent, 100);
        }

        bdt.onPageChanged = function (toPage) {
            showPage(toPage);
        }

        bdt.edit = (rowData) => {
            rowData.startEditing();
            rowData.persistChange = function () {
                Object.assign(rowData.oldValue, rowData.dataItem);
                rowData.endEditing();
            }
        }

        bdt.addNewItem = function () {
            if (bdt.options.callbacks && bdt.options.callbacks.onAddNewItem) {
                // for when host wants to handle adding of new item (e.g. add an item using a modal)
                bdt.options.callbacks.onAddNewItem();
                return;
            }
            var item = {};
            bdt.options.columns.forEach(col => {
                if (col.defaultValue !== undefined) {
                    item[col.field] = col.defaultValue;
                }
            });
            var rowData = buildNewRowData(item);
            rowData._isNewItem = true;
            bdt.tableData.rowDatas.push(rowData);
            addRowToTable(rowData);
            rowData.startEditing();
        };

        function addRowToTable(rowData) {
            var table = getTableElement();
            var tableBody = table.find('tbody');
            var tableRow = angular.element(document.createElement('tr'));
            bdt.options.columns.forEach(col => {
                var tableData = getTableDataElement(rowData, col);
                tableRow.append(tableData);
            });

            tableBody.append(tableRow);

        }

        bdt.delete = (rowData) => {
            rowData.persistChange = function () {
                removeRowData(rowData);
            }
            bdt.options.callbacks.onDelete(rowData);
        }

        bdt.onValueChange = function (rowData, col) {
            if (col.onValueChange) {
                col.onValueChange(rowData.dataItem, rowData);
            }
        }

        bdt.save = (rowData) => {
            if (rowData._isNewItem) {
                rowData.persistChange = () => {
                    rowData._isNewItem = false;
                    Object.assign(rowData.oldValue, rowData.dataItem);
                    rowData.endEditing();
                }
                bdt.options.callbacks.onSaveNew(rowData);
            }
            else {
                bdt.options.callbacks.onSaveEdit(rowData);
            }
        }

        bdt.cancelEdit = function (rowData) {
            rowData.endEditing();
            if (rowData._isNewItem) {
                removeRowData(rowData);
            }
        };

        bdt.isEditable = () => bdt.options && bdt.options.isEditable;

        function removeRowData(rowData) {
            tbc.removeFromArray(bdt.tableData.rowDatas, rowData);
            buildComponent();
        }

        function buildNewRowData(item) {
            var rowData = {
                rowId: _lastRowId++,
                oldValue: item,
                dataItem: Object.assign({}, item),
                isEditing: false,
                startEditing: () => {
                    rowData.isEditing = true;
                    Object.assign(rowData.dataItem, rowData.oldValue);
                },
                cancelEditing: () => {
                    if (rowData._isNewItem) {
                        removeRowData(rowData);
                        return;
                    }
                    rowData.isEditing = false;
                    Object.assign(rowData.dataItem, rowData.oldValue);
                },
                commitEdit: () => {
                    rowData.isEditing = false;
                    Object.assign(rowData.oldValue, rowData.dataItem);;
                },
                remove: () => {
                    removeRowData(rowData);
                }
            };

            return rowData;
        }

        function buildComponent() {
            _tableContainer.empty();
            if (_tableElement && _tableElement.remove) _tableElement.remove();
            _tableElement = null;
            var table = getTableElementWithContents();
            _tableContainer.append(table);
        }

        function getTableElementWithContents() {
            var table = getTableElement();
            var tableHeaderRow = table.find('thead > tr');

            // build headers
            bdt.options.columns.forEach(col => {
                var tableHeader = getTableHeaderElement(col);
                tableHeaderRow.append(tableHeader);
            });

            // add actions column header
            //if (bdt.options.buttons.length > 0) {
            //    var header = angular.element(document.createElement('th'));
            //    header.html('Actions');
            //    tableHeaderRow.append(header);
            //}

            if (bdt.isBusy) {
                addBusyRowToTable();
            }
            else if (bdt.tableData.rowDatas.length == 0) {
                addEmptyRowToTable();
            }
            else {
                // build data rows
                bdt.tableData.rowDatas.forEach(rowData => {
                    addRowToTable(rowData);
                });
            }

            return table;
        }

        function addEmptyRowToTable() {
            var scope = $scope.$new();
            scope.options = bdt.options;
            scope.showEmptyRow = function () {
                return bdt.tableData.rowDatas.length === 0;
            };
            var td = $compile(bdt.noResultRowTemplate)(scope);

            var table = getTableElement();
            var tableBody = table.find('tbody');
            var tableRow = angular.element(document.createElement('tr'));
            tableRow.append(td);
            tableBody.append(tableRow);
        }

        function addBusyRowToTable() {
            var scope = $scope.$new();
            scope.options = bdt.options;
            var td = $compile(bdt.busyRowTemplate)(scope);

            var table = getTableElement();
            var tableBody = table.find('tbody');
            var tableRow = angular.element(document.createElement('tr'));
            tableRow.append(td);
            tableBody.append(tableRow);
        }

        function getTableElement() {
            if (_tableElement) {
                return _tableElement;
            }

            var tableScope = $scope.$new();
            tableScope = Object.assign(tableScope, bdt.options);
            tableScope = Object.assign(tableScope, bdt.options.scope);
            _tableElement = $compile(getTableTemplate(bdt.options))(tableScope);
            return _tableElement;
        }

        function getTableTemplate(options) {
            return bdt.tableTemplate;
        }

        function getTableHeaderElement(col) {
            var scope = $scope.$new();
            scope.column = col;
            scope.headerTemplate = col.headerTemplate || `<span>{{'${col.headerText}'}}</span>`
            Object.assign(scope, bdt.options.scope);
            var el = $compile(bdt.tableHeaderTemplate)(scope);
            el.append($compile(scope.headerTemplate)(scope));
            return el;
        }

        function getTableDataElement(row, col) {
            var scope = $scope.$new();
            Object.assign(scope, bdt.options.scope);
            scope.column = col;
            scope.column._onValueChange = bdt.onValueChange;
            scope.rowData = row;
            scope.dataItem = row.dataItem;
            var el = $compile(getTableDataTemplate(row, col))(scope);
            return el;
        }

        function getTableDataTemplate(rowData, column) {
            var template = column.dataTemplate ?
                `<td ng-class="column.columnClass" ng-style="column.style">${column.dataTemplate(rowData.dataItem, rowData, column)}</td>` :
                bdt.tableDataTemplate;
            return template;
        }
    }
})();
