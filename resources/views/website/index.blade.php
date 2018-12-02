@extends('layouts.app')
@section('content')
<div class='filter' id='filter'><img src="icons/arrow-right-solid.svg"></div>
<div id="mapid"></div>
<div id="myFilter" class="myfilter">
    <a href="javascript:void(0)" class="closebtn closefilter" >&times;</a>
    <div class='filter-content' id='filter-content'>
        <h4>Filter podľa tagu</h2>
        <select id="tagSelect" class="multipleSelect" multiple placeholder="Vyberte tagy" name="language">
        </select>
        <div class='accept-container'>
            <button type="button" class="btn btn-primary accept">Filtruj</button>
        </div>
        <h4>Filter potenciálnych dedín</h2>
        <div class='potential-container'>        
            <button type="button" class="btn btn-primary potential">Filtruj</button>
        </div>
    </div>
</div>
<div id="mySidenav" class="sidenav">
    <div class='magic' id='magic'>
        <a href="javascript:void(0)" class="closebtn closesidenav" >&times;</a>
        <div id='sidenav-content'>
        </div>
        <div id='legend'>
            <h3>Legenda</h3>
            <div class='my-legend'>
                <div class='legend-scale'>
                    <ul class='legend-labels'>
                        <li><span style='background:orange;'></span>Dedina</li>
                        <li><span style='background:red;'></span>Autobusová zástavka</li>
                        <li><span style='background:green;'></span>Vlaková stanica</li>
                        <li><span style='background:purple;'></span>Obchody</li>
                        <li><span style='background:blue;'></span>Pokrytie obce zástavkami</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="loader-overlay-container" id="loading" style="display:none">
    <div class="loader overlay"></div>
</div>
@endsection
@push('scripts')
<script type="text/javascript" src="{{ asset('js/en.js') }}"></script>
<script type="text/javascript" src="{{ asset('js/sk.js') }}"></script>
<script src="{{ asset('js/custom.js') }}"></script>
<script src="lib/fastselect/fastselect.standalone.js"></script>
<script>
    $(document).ready(function() {
        $('.multipleSelect').fastselect();
    });
</script>
@endpush
