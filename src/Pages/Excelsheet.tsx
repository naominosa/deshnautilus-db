import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../Styles/styles.css";
export interface Property {
  id?: string;
  DATE: string;
  PROPERTY: string;
  VALUE: number;
  COMMISSION: number;
  TITLE: string;
  CONTACT: string;
  PURPOSE: string;
  ADDRESS: string;
  REFERENCE_NO: string;
}

function Excelsheet() {
  const [data, setData] = useState<Property[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentRow, setCurrentRow] = useState<any>(null);

  const propertiesCollection = collection(db, "properties");

  const formatNumber = (num: any) => {
    const val = Number(num);
    return isNaN(val) ? num : new Intl.NumberFormat("en-US").format(val);
  };

  const fetchData = async () => {
    const snapshot = await getDocs(propertiesCollection);
    const fetchedData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Property[];
    // Sort descending by date (newest first)
    fetchedData.sort((a, b) => b.DATE.localeCompare(a.DATE));
    setData(fetchedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo<MRT_ColumnDef<Property>[]>(
    () => [
      { accessorKey: "DATE", header: "Date", enableSorting: true },
      { accessorKey: "PROPERTY", header: "Property Name" },
      { accessorKey: "VALUE", header: "Value", Cell: ({ cell }) => formatNumber(cell.getValue()) },
      { accessorKey: "COMMISSION", header: "Comm.", Cell: ({ cell }) => formatNumber(cell.getValue()) },
      { accessorKey: "CONTACT", header: "Contacts" },
      { accessorKey: "ADDRESS", header: "Address" },
    ],
    []
  );

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setAnchorEl(e.currentTarget);
    setCurrentRow(row);
  };

  return (
    <div className="container">
      <h1 className="title">Desh Nautilus — Property Management</h1>

      <div className="form-card">
        <h3 className="form-title">Add New Listing</h3>
        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);

            const newEntry: Property = {
              DATE: fd.get("DATE") as string,
              PROPERTY: fd.get("PROPERTY") as string,
              VALUE: Number(fd.get("VALUE")),
              COMMISSION: Number(fd.get("COMMISSION")),
              CONTACT: fd.get("CONTACT") as string,
              ADDRESS: fd.get("ADDRESS") as string,
              TITLE: "",
              PURPOSE: "",
              REFERENCE_NO: "",
            };

            try {
              const docRef = await addDoc(propertiesCollection, newEntry);

              // Add new property at the top immediately
              setData((prevData) => [{ ...newEntry, id: docRef.id }, ...prevData]);

              (e.target as HTMLFormElement).reset();
              console.log("Property added successfully!");
            } catch (error) {
              console.error("Error adding property: ", error);
              alert("Failed to add property. Check your connection.");
            }
          }}
        >
          <div className="input-group">
            <label>Date</label>
            <input name="DATE" type="date" required />
          </div>
          <div className="input-group">
            <label>Property Name</label>
            <input name="PROPERTY" type="text" placeholder="e.g. Blue Lagoon Villa" />
          </div>
          <div className="input-group">
            <label>Value</label>
            <input name="VALUE" type="number" placeholder="0.00" required />
          </div>
          <div className="input-group">
            <label>Commission</label>
            <input name="COMMISSION" type="number" placeholder="0.00" required />
          </div>
          <div className="input-group">
            <label>Contacts (comma separated)</label>
            <input name="CONTACT" type="text" placeholder="080..., 090..." />
          </div>
          <div className="input-group">
            <label>Full Address</label>
            <input name="ADDRESS" type="text" placeholder="Street, City" />
          </div>
          <button type="submit" className="submit-btn">
            Save Property to Nautilus
          </button>
        </form>
      </div>

      <MaterialReactTable
        columns={columns}
        data={data}
        enableEditing
        editDisplayMode="modal"
        onEditingRowSave={async ({ values, row, exitEditingMode }) => {
          await updateDoc(doc(db, "properties", row.original.id!), {
            ...values,
            VALUE: Number(values.VALUE),
            COMMISSION: Number(values.COMMISSION),
          });
          await fetchData();
          exitEditingMode();
        }}
        renderRowActions={({ row, table }) => (
          <>
            <IconButton onClick={(e) => handleMenuOpen(e, row)}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                className="edit-btn"
                onClick={() => {
                  table.setEditingRow(currentRow);
                  setAnchorEl(null);
                }}
              >
                Edit Entry
              </MenuItem>
              <MenuItem
                className="delete-btn"
                onClick={async () => {
                  if (window.confirm("Delete?")) {
                    await deleteDoc(doc(db, "properties", currentRow.original.id));
                    fetchData();
                  }
                  setAnchorEl(null);
                }}
              >
                Delete Permanently
              </MenuItem>
            </Menu>
          </>
        )}
        enableRowActions
        muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "12px", border: "1px solid #e0e0e0" } }}
      />
    </div>
  );
}

export default Excelsheet;
