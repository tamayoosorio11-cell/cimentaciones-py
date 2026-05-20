Attribute VB_Name = "ModGestion"
Option Explicit

Private Const HOJA_CONFIG As String = "_Proyectos"

Public Sub MostrarInicio()
    frmInicio.Show
End Sub

Public Sub NuevoProyecto()
    Dim nombre As String
    nombre = InputBox("Nombre del nuevo proyecto:", "Nuevo proyecto", "Proyecto Cimentaciones")
    If Trim(nombre) = "" Then Exit Sub

    Dim resp As VbMsgBoxResult
    resp = MsgBox("Guardar el proyecto actual antes de crear uno nuevo?", vbYesNoCancel + vbQuestion, "Guardar")
    If resp = vbCancel Then Exit Sub
    If resp = vbYes Then Call GuardarProyecto

    Call LimpiarHojasEntrada(nombre)
    On Error Resume Next
    ThisWorkbook.Windows(1).Caption = "Cimentaciones Pro - " & nombre
    On Error GoTo 0
    MsgBox "Proyecto '" & nombre & "' creado.", vbInformation, "Nuevo proyecto"
End Sub

Public Sub GuardarProyecto()
    Dim wsProj As Worksheet
    Dim nombre As String
    Dim fila As Long

    On Error Resume Next
    nombre = ThisWorkbook.Sheets("Datos").Range("B2").Value
    On Error GoTo 0
    If Trim(nombre) = "" Then nombre = "Proyecto sin nombre"

    Set wsProj = ObtenerHojaProyectos()
    fila = BuscarFilaProyecto(wsProj, nombre)

    If fila = 0 Then
        fila = wsProj.Cells(wsProj.Rows.Count, 1).End(xlUp).Row + 1
        If fila = 1 Then fila = 2
        Randomize
        wsProj.Cells(fila, 1).Value = Format(Now, "yyyymmddhhmmss") & CStr(Int(Rnd * 9999))
        wsProj.Cells(fila, 2).Value = nombre
        wsProj.Cells(fila, 3).Value = Format(Now, "yyyy-mm-dd hh:mm:ss")
    End If

    wsProj.Cells(fila, 4).Value = Format(Now, "yyyy-mm-dd hh:mm:ss")
    wsProj.Cells(fila, 5).Value = SerializarProyecto()

    MsgBox "Proyecto '" & nombre & "' guardado." & Chr(10) & _
           "Fecha: " & Format(Now, "dd/mm/yyyy hh:mm"), vbInformation, "Guardar"
End Sub

Public Sub AbrirProyecto()
    Dim wsProj As Worksheet
    Set wsProj = ObtenerHojaProyectos()

    Dim ultima As Long
    ultima = wsProj.Cells(wsProj.Rows.Count, 1).End(xlUp).Row

    If ultima < 2 Or wsProj.Cells(2, 1).Value = "" Then
        MsgBox "No hay proyectos guardados.", vbInformation, "Abrir"
        Exit Sub
    End If

    Dim i As Long, n As Long, lista As String
    n = 0
    For i = ultima To 2 Step -1
        If wsProj.Cells(i, 1).Value <> "" Then
            n = n + 1
            lista = lista & n & ". " & wsProj.Cells(i, 2).Value & _
                    "   (" & wsProj.Cells(i, 4).Value & ")" & Chr(10)
        End If
    Next i

    Dim sel As String
    sel = InputBox("Seleccione el numero del proyecto:" & Chr(10) & Chr(10) & lista, "Abrir proyecto", "1")
    If Trim(sel) = "" Then Exit Sub

    Dim idx As Integer
    idx = CInt(sel)
    If idx < 1 Or idx > n Then MsgBox "Numero invalido.", vbExclamation: Exit Sub

    Dim filaSelec As Long, cnt As Long
    cnt = 0
    For i = ultima To 2 Step -1
        If wsProj.Cells(i, 1).Value <> "" Then
            cnt = cnt + 1
            If cnt = idx Then filaSelec = i: Exit For
        End If
    Next i

    Call DeserializarProyecto(wsProj.Cells(filaSelec, 5).Value)
    On Error Resume Next
    ThisWorkbook.Windows(1).Caption = "Cimentaciones Pro - " & wsProj.Cells(filaSelec, 2).Value
    On Error GoTo 0
    MsgBox "Proyecto '" & wsProj.Cells(filaSelec, 2).Value & "' cargado.", vbInformation, "Abrir"
End Sub

Public Sub AbrirArchivoExterno()
    Dim ruta As String
    ruta = Application.GetOpenFilename("Archivos Cimentaciones (*.xlsm), *.xlsm", , "Abrir proyecto externo")
    If ruta = "False" Or ruta = "" Then Exit Sub
    Workbooks.Open ruta
End Sub

Public Sub ExportarJSON()
    Dim nombre As String
    On Error Resume Next
    nombre = ThisWorkbook.Sheets("Datos").Range("B2").Value
    On Error GoTo 0
    If Trim(nombre) = "" Then nombre = "proyecto"

    Dim ruta As String
    ruta = Application.GetSaveAsFilename( _
        InitialFileName:=nombre & ".json", _
        FileFilter:="JSON (*.json), *.json", _
        Title:="Exportar como JSON")
    If ruta = "False" Or ruta = "" Then Exit Sub

    Dim fso As Object, arch As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set arch = fso.CreateTextFile(ruta, True, False)
    arch.Write SerializarProyecto()
    arch.Close
    MsgBox "Exportado correctamente:" & Chr(10) & ruta, vbInformation, "Exportar JSON"
End Sub

Public Sub ImportarJSON()
    Dim ruta As String
    ruta = Application.GetOpenFilename("JSON (*.json), *.json", , "Importar desde JSON")
    If ruta = "False" Or ruta = "" Then Exit Sub

    Dim fso As Object, arch As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set arch = fso.OpenTextFile(ruta, 1, False)
    Dim json As String
    json = arch.ReadAll
    arch.Close

    On Error GoTo ErrImp
    Call DeserializarProyecto(json)
    MsgBox "Proyecto importado correctamente.", vbInformation, "Importar JSON"
    Exit Sub
ErrImp:
    MsgBox "Error al importar. Verifique que sea un JSON valido.", vbCritical, "Error"
End Sub

Public Sub EliminarProyecto()
    Dim wsProj As Worksheet
    Set wsProj = ObtenerHojaProyectos()
    Dim ultima As Long
    ultima = wsProj.Cells(wsProj.Rows.Count, 1).End(xlUp).Row
    If ultima < 2 Then MsgBox "No hay proyectos guardados.", vbInformation: Exit Sub

    Dim i As Long, n As Long, lista As String
    n = 0
    For i = 2 To ultima
        If wsProj.Cells(i, 2).Value <> "" Then
            n = n + 1
            lista = lista & n & ". " & wsProj.Cells(i, 2).Value & Chr(10)
        End If
    Next i

    Dim sel As String
    sel = InputBox("Seleccione el numero a eliminar:" & Chr(10) & Chr(10) & lista, "Eliminar", "")
    If Trim(sel) = "" Then Exit Sub

    Dim idx As Integer
    idx = CInt(sel) + 1
    If idx < 2 Or idx > ultima Then MsgBox "Numero invalido.", vbExclamation: Exit Sub

    Dim nomProj As String
    nomProj = wsProj.Cells(idx, 2).Value
    If MsgBox("Eliminar '" & nomProj & "'?", vbYesNo + vbExclamation, "Confirmar") = vbYes Then
        wsProj.Rows(idx).Delete
        MsgBox "Proyecto eliminado.", vbInformation, "Eliminar"
    End If
End Sub

' ── PRIVADAS ──────────────────────────────────────────────────────────────

Private Function ObtenerHojaProyectos() As Worksheet
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(HOJA_CONFIG)
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add
        ws.Name = HOJA_CONFIG
        ws.Visible = xlSheetVeryHidden
        ws.Cells(1, 1).Value = "ID"
        ws.Cells(1, 2).Value = "Nombre"
        ws.Cells(1, 3).Value = "FechaCreacion"
        ws.Cells(1, 4).Value = "FechaModificacion"
        ws.Cells(1, 5).Value = "Datos"
    End If
    Set ObtenerHojaProyectos = ws
End Function

Private Function BuscarFilaProyecto(ws As Worksheet, nombre As String) As Long
    Dim i As Long, ultima As Long
    ultima = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For i = 2 To ultima
        If ws.Cells(i, 2).Value = nombre Then
            BuscarFilaProyecto = i: Exit Function
        End If
    Next i
    BuscarFilaProyecto = 0
End Function

Private Sub LimpiarHojasEntrada(nombre As String)
    On Error Resume Next
    With ThisWorkbook.Sheets("Datos")
        .Range("B2").Value = nombre
        .Range("B3").Value = 1.5
        .Range("B4").Value = 3
        .Range("B5").Value = 0
        .Range("B6").Value = 10
    End With
    On Error GoTo 0
End Sub

Private Function SerializarProyecto() As String
    Dim ws As Worksheet
    Dim nombre As String, Df As String, FS As String, alpha As String, t As String

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Datos")
    nombre = CStr(ws.Range("B2").Value)
    Df    = Replace(CStr(CDbl(ws.Range("B3").Value)), ",", ".")
    FS    = Replace(CStr(CDbl(ws.Range("B4").Value)), ",", ".")
    alpha = Replace(CStr(CDbl(ws.Range("B5").Value)), ",", ".")
    t     = Replace(CStr(CDbl(ws.Range("B6").Value)), ",", ".")
    On Error GoTo 0

    Dim j As String
    j = "{" & Chr(10)
    j = j & "  ""nombre"": """ & EscJSON(nombre) & """," & Chr(10)
    j = j & "  ""Df"": " & Df & "," & Chr(10)
    j = j & "  ""FS"": " & FS & "," & Chr(10)
    j = j & "  ""inclinacion_alpha"": " & alpha & "," & Chr(10)
    j = j & "  ""tiempo_anios"": " & t & "," & Chr(10)
    j = j & "  ""columnas"": " & SerColumnas() & "," & Chr(10)
    j = j & "  ""sondeos"": " & SerSondeos() & Chr(10)
    j = j & "}"
    SerializarProyecto = j
End Function

Private Function SerColumnas() As String
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Columnas")
    On Error GoTo 0
    If ws Is Nothing Then SerColumnas = "[]": Exit Function

    Dim arr As String, i As Long, ultima As Long, primero As Boolean
    ultima = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    primero = True
    arr = "["
    For i = 3 To ultima
        If CStr(ws.Cells(i, 1).Value) <> "" Then
            If Not primero Then arr = arr & ","
            primero = False
            arr = arr & Chr(10) & "    {""id"":""" & ws.Cells(i, 1).Value & ""","
            arr = arr & """x"":" & Replace(CStr(CDbl(ws.Cells(i, 2).Value)), ",", ".") & ","
            arr = arr & """y"":" & Replace(CStr(CDbl(ws.Cells(i, 3).Value)), ",", ".") & ","
            arr = arr & """P"":" & Replace(CStr(CDbl(ws.Cells(i, 4).Value)), ",", ".") & ","
            arr = arr & """B"":" & Replace(CStr(CDbl(ws.Cells(i, 5).Value)), ",", ".") & ","
            arr = arr & """L"":" & Replace(CStr(CDbl(ws.Cells(i, 6).Value)), ",", ".") & ","
            arr = arr & """tipo"":""" & ws.Cells(i, 7).Value & """}"
        End If
    Next i
    arr = arr & Chr(10) & "  ]"
    SerColumnas = arr
End Function

Private Function SerSondeos() As String
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Sondeos")
    On Error GoTo 0
    If ws Is Nothing Then SerSondeos = "[]": Exit Function

    Dim arr As String, i As Long, ultima As Long, primero As Boolean
    ultima = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    primero = True
    arr = "[" & Chr(10) & "    {""id"":""S1"",""x"":0,""y"":0,"
    arr = arr & """Nf"":" & Replace(CStr(CDbl(ws.Cells(2, 2).Value)), ",", ".") & ","
    arr = arr & """estratos"":["

    For i = 4 To ultima
        If CStr(ws.Cells(i, 1).Value) <> "" Then
            If Not primero Then arr = arr & ","
            primero = False
            arr = arr & Chr(10) & "      {""tipo"":""" & ws.Cells(i, 1).Value & ""","
            arr = arr & """h"":" & Replace(CStr(CDbl(ws.Cells(i, 2).Value)), ",", ".") & ","
            arr = arr & """gamma"":" & Replace(CStr(CDbl(ws.Cells(i, 3).Value)), ",", ".") & ","
            arr = arr & """gamma_sat"":" & Replace(CStr(CDbl(ws.Cells(i, 4).Value)), ",", ".") & ","
            arr = arr & """c"":" & Replace(CStr(CDbl(ws.Cells(i, 5).Value)), ",", ".") & ","
            arr = arr & """phi"":" & Replace(CStr(CDbl(ws.Cells(i, 6).Value)), ",", ".") & ","
            arr = arr & """Es"":" & Replace(CStr(CDbl(ws.Cells(i, 7).Value)), ",", ".") & ","
            arr = arr & """mu"":" & Replace(CStr(CDbl(ws.Cells(i, 8).Value)), ",", ".")
            If UCase(CStr(ws.Cells(i, 1).Value)) = "COHESIVO" Then
                arr = arr & ",""eo"":" & Replace(CStr(CDbl(ws.Cells(i, 9).Value)), ",", ".") & ","
                arr = arr & """Cc"":" & Replace(CStr(CDbl(ws.Cells(i, 10).Value)), ",", ".") & ","
                arr = arr & """Cs"":" & Replace(CStr(CDbl(ws.Cells(i, 11).Value)), ",", ".") & ","
                arr = arr & """sigma_p"":" & Replace(CStr(CDbl(ws.Cells(i, 12).Value)), ",", ".")
            End If
            arr = arr & "}"
        End If
    Next i
    arr = arr & Chr(10) & "    ]}]"
    SerSondeos = arr
End Function

Public Sub DeserializarProyecto(json As String)
    On Error Resume Next
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Datos")
    ws.Range("B2").Value = ExtraerJSON(json, "nombre")
    ws.Range("B3").Value = CDbl(ExtraerJSON(json, "Df"))
    ws.Range("B4").Value = CDbl(ExtraerJSON(json, "FS"))
    ws.Range("B5").Value = CDbl(ExtraerJSON(json, "inclinacion_alpha"))
    ws.Range("B6").Value = CDbl(ExtraerJSON(json, "tiempo_anios"))
    On Error GoTo 0
End Sub

Private Function ExtraerJSON(json As String, clave As String) As String
    Dim pos As Long, ini As Long, fin As Long
    pos = InStr(json, """" & clave & """")
    If pos = 0 Then Exit Function
    pos = pos + Len(clave) + 2
    Do While Mid(json, pos, 1) <> ":" And pos < Len(json): pos = pos + 1: Loop
    pos = pos + 1
    Do While Mid(json, pos, 1) = " " And pos < Len(json): pos = pos + 1: Loop
    If Mid(json, pos, 1) = """" Then
        ini = pos + 1: fin = InStr(ini, json, """")
        ExtraerJSON = Mid(json, ini, fin - ini)
    Else
        ini = pos: fin = ini
        Do While InStr("0123456789.-", Mid(json, fin, 1)) > 0 And fin <= Len(json): fin = fin + 1: Loop
        ExtraerJSON = Mid(json, ini, fin - ini)
    End If
End Function

Private Function EscJSON(s As String) As String
    EscJSON = Replace(Replace(Replace(s, "\", "\\"), """", "\"""), Chr(10), "\n")
End Function
