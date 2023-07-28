import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';
import { Button, Card, TextField } from '@mui/material';
import httpClient from './httpClient';
import { nanoid } from '@reduxjs/toolkit';

function createData(name, calories, fat, carbs, protein) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'name',
    label: 'Name',
  },
  {
    id: 'action',
    label: '',
  },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};
const dbName = 'todoDB';
const storeName = 'todoStore';

const backgroundSyncDbName = 'workbox-background-sync';
const backgroundSyncStoreName = 'requests';

export default function EnhancedTable() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [textFieldValue, setTextFieldValue] = React.useState('');
  const [todos, setTodos] = React.useState([]);
  const [refreshGetTodos, setRefreshGetTodos] = React.useState({});

  React.useEffect(() => {
    const getTodos = async () => {
      try {
        const response = await httpClient.get('/todos');
        const dbOpenRequest = indexedDB.open(dbName, 1);
        dbOpenRequest.onupgradeneeded = function (event) {
          const db = event.target.result;
          db.createObjectStore(storeName, { keyPath: 'id' });
        };
        dbOpenRequest.onsuccess = function (event) {
          const db = event.target.result;
          const txn = db.transaction(storeName, 'readwrite');
          const store = txn.objectStore(storeName);
          const clearRequest = store.clear();
          clearRequest.onsuccess = function () {
            response.data.forEach((hospital) => {
              store.add(hospital);
            });
          };
        };
        setTodos(response.data);
      } catch (error) {
        const dbOpenRequest = indexedDB.open('todoDB', 1);
        dbOpenRequest.onsuccess = function (event) {
          const db = event.target.result;
          const txn = db.transaction(storeName, 'readonly');
          const store = txn.objectStore(storeName);
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = function () {
            setTodos(getAllRequest.result);
          };
        };
      }
    };
    getTodos();
  }, [refreshGetTodos]);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = todos.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - todos.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(todos, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [order, orderBy, page, rowsPerPage, todos]
  );

  const createTodo = async () => {
    try {
      await httpClient.post('/todos', {
        id: nanoid(),
        name: textFieldValue,
        isCompleted: false,
      });
    } catch (error) {
      const dbOpenRequest = indexedDB.open(dbName, 1);
      dbOpenRequest.onsuccess = function (event) {
        const db = event.target.result;
        const txn = db.transaction(storeName, 'readwrite');
        const store = txn.objectStore(storeName);
        store.add({
          id: nanoid(),
          name: textFieldValue,
          isCompleted: false,
        });
      };
      throw error;
    } finally {
      setRefreshGetTodos({});
    }
  };

  const completeTodo = async (checked, id) => {
    try {
      await httpClient.patch(`/todos/${id}`, {
        isCompleted: checked,
      });
    } catch (error) {
      const dbOpenRequest = indexedDB.open(dbName, 1);
      dbOpenRequest.onsuccess = function (event) {
        const db = event.target.result;
        const txn = db.transaction(storeName, 'readwrite');
        const store = txn.objectStore(storeName);
        const getRequest = store.get(id);
        getRequest.onsuccess = function () {
          store.put({
            ...getRequest.result,
            isCompleted: checked,
          });
        };
      };
    } finally {
      setRefreshGetTodos({});
    }
  };

  const deleteTodo = async (id) => {
    await httpClient.delete(`/todos/${id}`);
    setRefreshGetTodos({});
  };

  const doSync = () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function (registration) {
          return registration.sync.register('workbox-background-sync:patch-todo-queue');
        })
        .then(function () {
          console.log('Sync registered successfully');
        })
        .catch(function (error) {
          console.log('Sync registration failed:', error);
        });
    }
  };

  const logCacheRequest = () => {
    const dbOpenRequest = indexedDB.open(backgroundSyncDbName, 3);
    dbOpenRequest.onsuccess = function (event) {
      const db = event.target.result;
      const txn = db.transaction(backgroundSyncStoreName, 'readwrite');
      const store = txn.objectStore(backgroundSyncStoreName);
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = function () {
        console.log('getAllRequest.result', getAllRequest.result);
      };
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ padding: '16px', marginBottom: '16px', display: 'flex' }}>
        <TextField
          required
          value={textFieldValue}
          onChange={(e) => setTextFieldValue(e.target.value)}
          id="filled-basic"
          label="Name"
          variant="filled"
          sx={{ width: '100%' }}
        />
        <Button onClick={createTodo} variant="contained" sx={{ marginLeft: '16px' }}>
          Save
        </Button>
        <Button onClick={doSync} variant="contained" sx={{ marginLeft: '16px' }}>
          Sync
        </Button>
      </Card>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={todos.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    // onClick={(event) => handleClick(event, row.name)}
                    role="checkbox"
                    // aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    // selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        onChange={(e) => completeTodo(e.target.checked, row.id)}
                        checked={row.isCompleted}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" padding="none">
                      {row.name}
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" padding="none">
                      <Button onClick={() => deleteTodo(row.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={todos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Button onClick={logCacheRequest} variant="contained" sx={{ marginLeft: '16px' }}>
        Log cache requests
      </Button>
    </Box>
  );
}
